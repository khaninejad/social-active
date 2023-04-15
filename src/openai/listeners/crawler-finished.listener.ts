import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ContentService } from "../../content/content.service";
import { CrawlFinishedEvent } from "../../events/crawl-finished.event";
import { OpenAIService } from "../openai.service";
import ruleInstance from "../rule.service";

@Injectable()
export class CrawlFinishedListener {
  constructor(
    private readonly openAIService: OpenAIService,
    private readonly contentService: ContentService
  ) {}

  @OnEvent("crawl.finished")
  async handleCrawlFinishedEvent(event: CrawlFinishedEvent) {
    Logger.log(`Listener started handleCrawlFinishedEvent ${event}`);
    const content = await this.contentService.getContentById(event.id);

    if (content) {
      const rules = ruleInstance.getRoles();
      const res = await this.openAIService.generateText(
        ruleInstance.getRoles()
      );
      Logger.debug(rules);
      Logger.debug(JSON.stringify(res));
      Logger.log(`Content generated for ${res} post`);
    }
    Logger.log(`Listener Finished`);
  }
}
