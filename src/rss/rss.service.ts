import { FeedData, FeedEntry, extract } from "@extractus/feed-extractor";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RssService {
  url_list: string[];

  setFeedUrls(urls: string[]) {
    this.url_list = urls;
  }

  async fetchURL(): Promise<FeedData[]> {
    if (!this.url_list) {
      throw new Error("Please provide a URL");
    }
    const task_list: Promise<FeedData>[] = [];
    //todo: fix failed rss and mark them as disabled
    this.url_list.forEach(async (url) => {
      task_list.push(extract(url));
    });
    return await Promise.all(task_list);
  }

  async mergeEntities(feedData: FeedData[]): Promise<FeedEntry[]> {
    if (!feedData) {
      throw new Error("Feed data is empty");
    }

    const uniqueLinkMap: { [key: string]: FeedEntry } = {};
    const uniqueTitleMap: { [key: string]: FeedEntry } = {};
    const result: FeedEntry[] = [];

    feedData.forEach((feed) => {
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

  async fetch(feeds: string[]): Promise<FeedEntry[]> {
    this.setFeedUrls(feeds);
    const feedData = await this.fetchURL();
    return this.mergeEntities(feedData);
  }
}