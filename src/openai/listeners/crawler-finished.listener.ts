import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { ContentService } from "../../content/content.service";
import { CrawlFinishedEvent } from "../../events/crawl-finished.event";
import { OpenAIService } from "../openai.service";
import { TwitterService } from "../../twitter/twitter.service";

@Injectable()
export class CrawlFinishedListener {
  private readonly logger = new Logger(CrawlFinishedListener.name);
  constructor(
    private readonly openAIService: OpenAIService,
    private readonly contentService: ContentService,
    private eventEmitter: EventEmitter2,
    private readonly twitterService: TwitterService
  ) {}

  @OnEvent("crawl.finished")
  async handleCrawlFinishedEvent(event: CrawlFinishedEvent) {
    try {
      this.logger.log(`Listener started handleCrawlFinishedEvent ${event}`);
      const content = await this.contentService.getContentById(event.id);

      if (content) {
        // this.logger.log(`Started to generate a content for ${content.id}`);
        // const prompt = new Prompt();
        // const roleInstance = prompt.getPrompt(content);
        // const tokenSize = this.openAIService.countTokens(roleInstance);

        // if (tokenSize >= configuration.getOpenAiEnv().max_token) {
        //   const errorMsg = "You have reached the max token";
        //   this.logger.error(errorMsg);
        //   throw new Error(errorMsg);
        // }

        // this.logger.warn(`token size of request instance: ${tokenSize}`);
        // // TODO: Check this generated content is related to the account
        // const res = await this.openAIService.generateText(roleInstance);
        // const generatedTokenSize = this.openAIService.countTokens(
        //   JSON.stringify(res)
        // );
        // this.logger.warn(
        //   `token size of generated content: ${generatedTokenSize}`
        // );
        // await this.contentService.updateGenerated({
        //   id: content.id,
        //   generated: {
        //     title: res.title,
        //     body: res.body,
        //     category: res.category,
        //     tags: res.tags,
        //   },
        // });
        // this.eventEmitter.emit(
        //   "generation.finished",
        //   new GenerationFinishedEvent(content.id)
        // );

        // this.logger.log("triggered");
        const tweet = await this.twitterService.tweet(
          content.account,
          content.title + " " + content.crawl.url
        );
        if (tweet) {
          await this.contentService.updateTweet({
            id: content.id,
            Tweet: {
              id: tweet.data.id,
              text: tweet.data.text,
            },
          });
          this.logger.log(
            `tweet published ${content.account} ${JSON.stringify(
              tweet.data
            )} post`
          );
        }
      }
    } catch (error) {
      this.logger.error(`handleCrawlFinishedEvent ${error}`);
    }
    this.logger.log(`Listener Finished`);
  }
}
