class Rules {
  rules: string[] = [];
  addRole(rule: string) {
    this.rules.push(rule);
  }

  getRoles() {
    return this.rules.join("\n");
  }
}
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
export default ruleInstance;
