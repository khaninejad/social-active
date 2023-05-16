import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ContentService } from "../../content/content.service";
import { WordpressPublishedEvent } from "../../events/wordpress-published.event";
import { TwitterService } from "../twitter.service";

@Injectable()
export class WordpressPublishedListener {
  private readonly logger: Logger = new Logger(WordpressPublishedListener.name);
  constructor(
    private readonly contentService: ContentService,
    private readonly twitterService: TwitterService
  ) {}

  @OnEvent("wordpress.published")
  async handleWordpressPublishedEvent(event: WordpressPublishedEvent) {
    this.logger.log(`Listener started handleWordpressPublishedEvent ${event}`);
    try {
      const content = await this.contentService.getContentById(event.id);
      if (content) {
        const tweet = await this.twitterService.tweet(
          content.account,
          content.blog.title + " " + content.blog.link
        );
        if (tweet) {
          await this.contentService.updateTweet({
            id: content.id,
            Tweet: {
              id: tweet.data.id,
              text: tweet.data.text,
            },
          });
          this.logger.log(`tweet published ${JSON.stringify(tweet.data)} post`);
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
    this.logger.log(`Listener Finished`);
  }
}
