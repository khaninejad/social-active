import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ContentService } from "../../content/content.service";
import { WordpressService } from "../wordpress.service";
import { CrawlFinishedEvent } from "../../events/crawl-finished.event";

@Injectable()
export class CrawlFinishedListener {
  constructor(
    private readonly wordpressService: WordpressService,
    private readonly contentService: ContentService
  ) {}

  @OnEvent("crawl.finished")
  async handleCrawlFinishedEvent(event: CrawlFinishedEvent) {
    Logger.log(`Listener started handleCrawlFinishedEvent ${event}`);
    const content = await this.contentService.getContentById(event.id);
    if (content) {
      const res = await this.wordpressService.createPost(
        content.title,
        content.crawl.raw_text,
        content.crawl.image
      );
      await this.contentService.updatePublish({
        id: content.id,
        blog: {
          id: res.id,
          title: res.title.raw,
          date: res.date,
        },
      });
      Logger.log(`Content updated for ${res.id} post`);
    }
    Logger.log(`Listener Finished`);
  }
}
