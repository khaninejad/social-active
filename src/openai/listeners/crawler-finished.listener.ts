import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { ContentService } from "../../content/content.service";
import { CrawlFinishedEvent } from "../../events/crawl-finished.event";
import { OpenAIService } from "../openai.service";
import ruleInstance from "../rule.service";
import { GenerationFinishedEvent } from "src/events/generation-finished.event";

@Injectable()
export class CrawlFinishedListener {
  constructor(
    private readonly openAIService: OpenAIService,
    private readonly contentService: ContentService,
    private eventEmitter: EventEmitter2
  ) {}

  @OnEvent("crawl.finished")
  async handleCrawlFinishedEvent(event: CrawlFinishedEvent) {
    Logger.log(`Listener started handleCrawlFinishedEvent ${event}`);
    const content = await this.contentService.getContentById(event.id);

    try {
      if (content) {
        Logger.log(`Started to generate a content for ${content.id}`);
        ruleInstance.addRole(`original content input:
{
  "feed_title": "${content.title}",
  "feed_link": "${content.link}",
  "feed_description": "${content.description}",
  "crawl": {
    "original_content_source":  "${this.getWebsiteName(content.crawl.url)}",
    "original_content_source_url": "${content.crawl.url}",
    "original_content_meta_title": "${content.crawl.title}",
    "original_content__meta_description": "${content.crawl.description}",
    "original_content_image": "${content.crawl.image}",
    "original_content_keyword": "${content.crawl.keyword}",
    "original_content_text": "${content.crawl.raw_text}",
  }
}
`);
        const rules = ruleInstance.getRoles();
        Logger.warn(rules);
        const res = await this.openAIService.generateText(rules);
        Logger.log(`Content generated for '${JSON.stringify(res)}' post`);
        await this.contentService.updateGenerated({
          id: content.id,
          generated: {
            title: res.title,
            body: res.body.replace("###", ""),
            category: res.category,
            tags: res.tags,
          },
        });
        this.eventEmitter.emit(
          "generation.finished",
          new GenerationFinishedEvent(content.id)
        );
      }
    } catch (error) {
      Logger.error(error);
    }
    Logger.log(`Listener Finished`);
  }
  getWebsiteName(url: string): string {
    const urlObject = new URL(url);
    const { hostname } = urlObject;
    const dotIndex = hostname.lastIndexOf(".");
    const secondLevelDomain = hostname.substring(0, dotIndex);
    const websiteName = secondLevelDomain.split(".").pop();
    return websiteName;
  }
}
