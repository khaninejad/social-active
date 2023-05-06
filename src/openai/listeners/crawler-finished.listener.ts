import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { ContentService } from "../../content/content.service";
import { CrawlFinishedEvent } from "../../events/crawl-finished.event";
import { OpenAIService } from "../openai.service";
import { GenerationFinishedEvent } from "../../events/generation-finished.event";
import { Rules } from "../rule.service";
import configuration from "../../app.const";

@Injectable()
export class CrawlFinishedListener {
  private readonly logger = new Logger(CrawlFinishedListener.name);
  constructor(
    private readonly openAIService: OpenAIService,
    private readonly contentService: ContentService,
    private eventEmitter: EventEmitter2
  ) {}

  @OnEvent("crawl.finished")
  async handleCrawlFinishedEvent(event: CrawlFinishedEvent) {
    try {
      this.logger.log(`Listener started handleCrawlFinishedEvent ${event}`);
      const content = await this.contentService.getContentById(event.id);

      if (content) {
        this.logger.log(`Started to generate a content for ${content.id}`);
        const roleInstance = this.getRules(content);
        const tokenSize = this.openAIService.countTokens(roleInstance);

        if (tokenSize >= configuration.getOpenaiEnv().max_token) {
          const errorMsg = "You have reached the max token";
          this.logger.error(errorMsg);
          throw new Error(errorMsg);
        }

        this.logger.warn(`token size of request instance: ${tokenSize}`);
        const res = await this.openAIService.generateText(roleInstance);
        const generatedTokenSize = this.openAIService.countTokens(
          JSON.stringify(res)
        );
        this.logger.warn(
          `token size of generated content: ${generatedTokenSize}`
        );
        await this.contentService.updateGenerated({
          id: content.id,
          generated: {
            title: res.title,
            body: res.body,
            category: res.category,
            tags: res.tags,
          },
        });
        this.eventEmitter.emit(
          "generation.finished",
          new GenerationFinishedEvent(content.id)
        );

        this.logger.log("triggered");
      }
    } catch (error) {
      this.logger.error(`handleCrawlFinishedEvent ${error}`);
    }
    this.logger.log(`Listener Finished`);
  }
  private getWebsiteName(url: string): string {
    const urlObject = new URL(url);
    const { hostname } = urlObject;
    const dotIndex = hostname.lastIndexOf(".");
    const secondLevelDomain = hostname.substring(0, dotIndex);
    const websiteName = secondLevelDomain.split(".").pop();
    return websiteName;
  }
  private getRules(content: any): string {
    const ruleInstance = new Rules();

    ruleInstance.addRole(`rephrase blog content using input and include source in body. Output as JSON with HTML tags in the body for SEO. External link to scientific sources required and a tags should be escaped for json string validation like
    JSON format:
    {
    "title": "new content title",
    "category": "new category",
    "tags": "new tags",
    "body": "new content (min. 500 words, separate paragraphs with <p> tag, escape <a> tags quotes like \") including content_source and content_source_url"
    }
    JSON template:
    {
    "feed_title": "rss feed title",
    "feed_link": "feed link for crawler",
    "feed_description": "rss feed description (usually trimmed)",
    "crawl": {
    "original_content_source": "rss feed source (usually website or company name)",
    "original_content_source_url": "source address that crawler reached after following feed_link",
    "original_content_meta_title": "target page meta title crawled by crawler",
    "original_content__meta_description": "target page meta description crawled by crawler (may be trimmed)",
    "original_content_keyword": "target keyword meta tag",
    "original_content_text": "all paragraphs found by crawler from target website related to feed_* and content_*"
    }
    }`);
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
        "original_content_keyword": "${content.crawl.keyword}",
        "original_content_text": "${content.crawl.raw_text}",
      }
    }
    `);
    return ruleInstance.getRoles();
  }
}
