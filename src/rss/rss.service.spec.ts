import { Test, TestingModule } from "@nestjs/testing";
import { RssService } from "./rss.service";

describe("RssService", () => {
  let service: RssService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RssService],
    }).compile();

    service = module.get<RssService>(RssService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("rss fetch", () => {
    it("should fetch the feed data single feed", async () => {
      service.setFeedUrls(["https://news.google.com/rss"]);
      const res = await service.fetchURL();
      expect(res[0].entries).toBeDefined();
      expect(res[0].entries.length).toBeGreaterThan(0);
    });
    it("should fetch the feed data multiple feeds", async () => {
      service.setFeedUrls([
        "https://news.google.com/rss",
        "https://rss.art19.com/apology-line",
      ]);
      const res = await service.fetchURL();
      expect(res).toBeDefined();
      expect(res.length).toBeGreaterThan(0);
    });

    it("should throw exception if no url provided", async () => {
      await expect(service.fetchURL()).rejects.toThrowError(
        "Please provide a URL"
      );
    });

    it("should throw exception if no feed exist", async () => {
      await expect(service.mergeEntities(undefined)).rejects.toThrowError(
        "Feed data is empty"
      );
    });
  });

  describe("mergeFeeds", () => {
    it("should fetch the feed data multiple feeds", async () => {
      service.setFeedUrls([
        "https://news.google.com/rss",
        "https://rss.art19.com/apology-line",
        "https://news.google.com/rss",
      ]);
      const feed_data = await service.fetchURL();
      const res = await service.mergeEntities(feed_data);
      expect(res).toBeDefined();
      expect(res.length).toBeGreaterThan(10);
    });
  });

  describe("fetch", () => {
    it("should fetch and return merged result", async () => {
      const res = await service.fetch(["https://news.google.com/rss"]);
      expect(res).toBeDefined();
      expect(res.length).toBeGreaterThan(10);
    });
  });
});
