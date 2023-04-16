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

    try {
      if (content) {
        const rules = ruleInstance.getRoles();
        const res = await this.openAIService.generateText(rules);
        Logger.log(`Content generated for '${JSON.stringify(res)}' post`);
        await this.contentService.updateGenerated({
          id: content.id,
          generated: {
            title: res.title,
            body: res.body,
            category: res.category,
            tags: res.tags,
          },
        });
      }
    } catch (error) {
      Logger.error(error);
    }
    Logger.log(`Listener Finished`);
  }
}
