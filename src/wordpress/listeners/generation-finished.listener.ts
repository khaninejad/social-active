import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { ContentService } from "../../content/content.service";
import { WordpressService } from "../wordpress.service";
import { GenerationFinishedEvent } from "../../events/generation-finished.event";
import { WordpressPublishedEvent } from "../../events/wordpress-published.event";

@Injectable()
export class CrawlFinishedListener {
  private readonly logger: Logger = new Logger(CrawlFinishedListener.name);
  constructor(
    private readonly wordpressService: WordpressService,
    private eventEmitter: EventEmitter2,
    private readonly contentService: ContentService
  ) {}

  @OnEvent("generation.finished")
  async handleGenerationFinishedEvent(event: GenerationFinishedEvent) {
    this.logger.log(`Listener started GenerationFinishedEvent ${event}`);
    try {
      const content = await this.contentService.getContentById(event.id);
      if (content) {
        let bodyContent = content.generated.body;
        if (!content.generated.body.includes(content.crawl.url)) {
          bodyContent += `\n<a href="${content.crawl.url}">Source</a>`;
        }
        const res = await this.wordpressService.createPost(
          content.generated.title,
          bodyContent,
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
        this.logger.log(`Content updated for ${JSON.stringify(res.id)} post`);
      }
    } catch (error) {
      this.logger.error(error);
    }
    this.logger.log(`Listener Finished`);
  }
}
