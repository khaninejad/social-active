import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { ContentUpdatedEvent } from "../../events/content-updated.event";
import { CrawlerService } from "../crawler.service";
import { ContentService } from "../../content/content.service";
import { CrawlFinishedEvent } from "../../events/crawl-finished.event";

@Injectable()
export class ContentUpdatedListener {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly contentService: ContentService,
    private eventEmitter: EventEmitter2
  ) {}

  @OnEvent("content.updated")
  async handleContentUpdatedEvent(event: ContentUpdatedEvent) {
    Logger.log(
      `handleContentUpdatedEvent Listener started ${JSON.stringify(event)}`
    );
    try {
      const contents =
        await this.contentService.getContentsByAccountNameForCrawl(event.name);
      if (contents[0]) {
        Logger.log(`started to crawl ${contents[0].id}`);
        const crawled = await this.crawlerService.crawl(contents[0].link);
        await this.contentService.updateCrawl({
          id: contents[0].id,
          crawl: crawled
            ? {
                url: crawled.url,
                title: crawled.title,
                description: crawled.description,
                image: crawled.image,
                keyword: crawled.keyword,
                raw_text: crawled.raw_text,
                crawl_date: new Date(),
              }
            : {
                url: "",
                title: "",
                description: "",
                image: "",
                keyword: "",
                raw_text: "",
                crawl_date: new Date(),
              },
        });
        Logger.log(`Content Updated`);
        this.eventEmitter.emit(
          "crawl.finished",
          new CrawlFinishedEvent(contents[0].id)
        );
      }
    } catch (error) {
      Logger.error(error);
    }
    Logger.log(`Listener Finished`);
  }
}
