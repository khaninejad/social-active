import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ContentUpdatedEvent } from "../../events/content-updated.event";
import { CrawlerService } from "../crawler.service";
import { ContentService } from "src/content/content.service";

@Injectable()
export class ContentUpdatedListener {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly contentService: ContentService
  ) {}

  @OnEvent("content.updated")
  async handleContentUpdatedEvent(event: ContentUpdatedEvent) {
    Logger.log(`Listener started ${event}`);
    const contents = await this.contentService.getContentsByAccountNameForCrawl(
      event.name
    );
    if (contents) {
      const crawled = await this.crawlerService.crawl(contents[0].link);
      const updated = await this.contentService.updateCrawl({
        id: contents[0].id,
        crawl: crawled
          ? {
              url: crawled.url,
              title: crawled.title,
              description: crawled.description,
              image: crawled.image,
              keyword: crawled.keyword,
              raw_text: crawled.raw_text,
            }
          : {
              url: "",
              title: "",
              description: "",
              image: "",
              keyword: "",
              raw_text: "",
            },
      });
      Logger.log(`Content Updated`);
    }
    Logger.log(`Listener Finished}`);
  }
}
