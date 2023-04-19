import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ContentService } from "../../content/content.service";
import { WordpressPublishedEvent } from "src/events/wordpress-published.event";
import { TwitterService } from "../twitter.service";

@Injectable()
export class WordpressPublishedListener {
  constructor(
    private readonly contentService: ContentService,
    private readonly twitterService: TwitterService
  ) {}

  @OnEvent("wordpress.published")
  async handleWordpressPublishedEvent(event: WordpressPublishedEvent) {
    Logger.log(`Listener started handleWordpressPublishedEvent ${event}`);
    const content = await this.contentService.getContentById(event.id);
    if (content) {
      const tweet = await this.twitterService.tweet(
        content.account,
        content.blog.title + " " + content.blog.link
      );
      Logger.log(`tweet published ${tweet} post`);
    }
    Logger.log(`Listener Finished`);
  }
}
