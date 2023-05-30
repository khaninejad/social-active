import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { ContentUpdatedEvent } from "../../events/content-updated.event";
import { CrawlerService } from "../crawler.service";
import { ContentService } from "../../content/content.service";
import { CrawlFinishedEvent } from "../../events/crawl-finished.event";
import { Content } from "../../content/interfaces/content.interface";

@Injectable()
export class ContentUpdatedListener {
  private readonly logger = new Logger(ContentUpdatedListener.name);
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly contentService: ContentService,
    private eventEmitter: EventEmitter2
  ) {}

  @OnEvent("content.updated")
  async handleContentUpdatedEvent(event: ContentUpdatedEvent) {
    this.logger.log(
      `handleContentUpdatedEvent Listener started ${JSON.stringify(event)}`
    );
    let contents: Content[] = [];
    try {
      contents = await this.contentService.getContentsByAccountNameForCrawl(
        event.name
      );
      if (contents[0]) {
        this.logger.log(
          `started to crawl ${contents[0].id} with link of ${contents[0].link}`
        );
        const crawled = await this.crawlerService.crawl(contents[0].link);
        if (crawled) {
          await this.contentService.updateCrawl({
            id: contents[0].id,
            crawl: {
              url: crawled.url,
              title: crawled.title,
              description: crawled.description,
              image: crawled.image,
              keyword: crawled.keyword,
              raw_text: crawled.raw_text,
              crawl_date: new Date(),
            },
          });
          this.logger.log(`crawled and Content Updated`);
          this.eventEmitter.emit(
            "crawl.finished",
            new CrawlFinishedEvent(contents[0].id)
          );
        } else {
          await this.contentService.updateCrawl({
            id: contents[0].id,
            crawl: null,
          });
          this.logger.error(`crawl was unsuccessfully`);
        }
      }
    } catch (error) {
      this.logger.error(`ContentUpdatedListener ${error}`);
      await this.contentService.updateCrawl({
        id: contents[0]?.id,
        crawl: null,
      });
    }
    this.logger.log(`Listener Finished`);
  }
}
