import { FeedData, FeedEntry, extract } from "@extractus/feed-extractor";
import { Injectable, Logger } from "@nestjs/common";

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
    try {
      const task_list: Promise<FeedData>[] = [];
      this.url_list.forEach(async (url) => {
        task_list.push(extract(url));
      });
      const results = await Promise.allSettled(task_list);
      const feedData: FeedData[] = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          feedData.push(result.value);
        } else {
          Logger.error(
            `Error extracting data from URL: ${this.url_list[index]}. ${result.reason}`
          );
        }
      });

      return feedData;
    } catch (error) {
      Logger.error(error + this.url_list);
    }
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
