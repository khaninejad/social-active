import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { ContentService } from "../../content/content.service";
import { CrawlFinishedEvent } from "../../events/crawl-finished.event";
import { OpenAIService } from "../openai.service";
import { GenerationFinishedEvent } from "src/events/generation-finished.event";
import { Rules } from "../rule.service";

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
        const roleInstance = this.getRules(content);
        Logger.warn(roleInstance);
        const res = await this.openAIService.generateText(roleInstance);
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
  getRules(content: any): string {
    const ruleInstance = new Rules();
    ruleInstance.addRole(
      "as a blog editor Rewrite content for blog post using blog input and follow below conditions."
    );
    ruleInstance.addRole(`our output should be like with html tags in the body for SEO purpose in json format:
{
  "title": "the new content title ",
  "category": "the new category",
  "tags": "the new tags",
  "body": "the new rewritten content " // min 500 words, separate paragraphs with html <p> tag.
}
`);
    ruleInstance.addRole(
      "include source of the news in new content we got this content in new content body at to the content  of content use content_source and content_source_url ."
    );
    ruleInstance.addRole("Do not include source name in the title.");
    ruleInstance.addRole(`follow this json template to understand fields:
{
  "feed_title": "This field is the rss feed title",
  "feed_link": "this field is for feed link that our crawler will follow to scrape its content",
  "feed_description": "this field is rss feed description which in most of the case is trimmed ",
  "crawl": { // this object for crawler which generated after our crawler visited the target
    "original_content_source": "this is the rss feed source in most of the case a website or company name",
    "original_content_source_url": "this is the source address that our crawler reached after following feed_link",
    "original_content_meta_title": "this is the target page meta title which crawled by our crawler  ",
    "original_content__meta_description": "this is the target page meta description which crawled by our crawler just like feed_description it may be trimmed",
    "original_content_image": "this is target website image meta tag",
    "original_content_keyword": "this is keyword meta tag of target",
    "original_content_text": "this is all paragraphs that founded by our crawler from target website which is related to feed_* and content_*. this is our main source of content",
  },
}`);
    ruleInstance.addRole("do not include crawl* in the content.");
    ruleInstance.addRole(
      "include at least 1 external link to scientific sources related to this content. make it within article should seems natural ."
    );
    ruleInstance.addRole("make sure it is a valid json.");
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
    return ruleInstance.getRoles();
  }
}
