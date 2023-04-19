import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { ContentService } from "../../content/content.service";
import { WordpressService } from "../wordpress.service";
import { GenerationFinishedEvent } from "src/events/generation-finished.event";
import { WordpressPublishedEvent } from "src/events/wordpress-published.event";

@Injectable()
export class CrawlFinishedListener {
  constructor(
    private readonly wordpressService: WordpressService,
    private eventEmitter: EventEmitter2,
    private readonly contentService: ContentService
  ) {}

  @OnEvent("generation.finished")
  async handleGenerationFinishedEvent(event: GenerationFinishedEvent) {
    Logger.log(`Listener started GenerationFinishedEvent ${event}`);
    const content = await this.contentService.getContentById(event.id);
    if (content) {
      const res = await this.wordpressService.createPost(
        content.generated.title,
        content.generated.body,
        content.crawl.image,
        content.generated.category.split(","),
        content.generated.tags.split(",")
      );
      await this.contentService.updatePublish({
        id: content.id,
        blog: {
          id: res.id,
          title: res.title.raw,
          link: res.link,
          slug: res.slug,
          date: res.date,
        },
      });
      this.eventEmitter.emit(
        "wordpress.published",
        new WordpressPublishedEvent(content.id)
      );
      Logger.log(`Content updated for ${JSON.stringify(res)} post`);
    }
    Logger.log(`Listener Finished`);
  }
}
