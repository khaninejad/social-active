export class Prompt {
  prompts: string[] = [];
  addPrompt(rule: string) {
    this.prompts.push(rule);
  }

  joinPrompt() {
    return this.prompts.join("\n");
  }

  getPrompt(content: any): string {
    const promptInstance = new Prompt();

    promptInstance.addPrompt(`rephrase blog content using input and include source in body. Output as JSON with HTML tags in the body for SEO. External link to sources is always required and a tags should be escaped for json string validation like
    JSON format:
    {
    "title": "new content title",
    "category": "new category",
    "tags": "new tags",
    "body": "new content (min. 500 words, separate paragraphs with <p> tag, escape double quotes include <a> tags quotes like \") must including content_source and content_source_url"
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
    promptInstance.addPrompt(`original content input:
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
    return promptInstance.joinPrompt();
  }

  private getWebsiteName(url: string): string {
    const urlObject = new URL(url);
    const { hostname } = urlObject;
    const dotIndex = hostname.lastIndexOf(".");
    const secondLevelDomain = hostname.substring(0, dotIndex);
    const websiteName = secondLevelDomain.split(".").pop();
    return websiteName;
  }
}
