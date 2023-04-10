import { FeedData, FeedEntry, extract } from "@extractus/feed-extractor";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RssService {
  url_list: string[];
  feedData: FeedData[];
  task_list: Promise<FeedData>[] = [];
  setFeedUrls(urls: string[]) {
    this.url_list = urls;
  }
  async fetchURL() {
    if (!this.url_list) {
      throw new Error("Please provide a URL");
    }
    this.url_list.forEach(async (url) => {
      this.task_list.push(extract(url));
    });
    this.feedData = await Promise.all(this.task_list);
  }
  async mergeEntities(): Promise<FeedEntry[]> {
    if (!this.feedData) {
      throw new Error("Feed data is empty");
    }
    const uniqueLinkMap: { [key: string]: FeedEntry } = {};
    const uniqueTitleMap: { [key: string]: FeedEntry } = {};
    const result: FeedEntry[] = [];
    this.feedData.forEach((feed) => {
      feed.entries.forEach((feedRow) => {
        const entryImpl = feedRow;
        if (
          !uniqueLinkMap[entryImpl.link] &&
          !uniqueTitleMap[entryImpl.title] &&
          entryImpl.link
        ) {
          uniqueLinkMap[entryImpl.link] = entryImpl;
          uniqueTitleMap[entryImpl.title] = entryImpl;
          result.push(entryImpl);
        }
      });
    });
    return result;
  }
}
