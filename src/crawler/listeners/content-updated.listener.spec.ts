import { EventEmitter2 } from "@nestjs/event-emitter";
import { ContentService } from "../../content/content.service";
import { ContentUpdatedEvent } from "../../events/content-updated.event";
import { CrawlerService } from "../crawler.service";
import { ContentUpdatedListener } from "./content-updated.listener";
import { Model } from "mongoose";
import { Content } from "../../content/interfaces/content.interface";
import { CrawlFinishedEvent } from "../../events/crawl-finished.event";

describe("ContentUpdatedListener", () => {
  let contentService: ContentService;
  let crawlerService: CrawlerService;
  let eventEmitter: EventEmitter2;
  let listener: ContentUpdatedListener;
  const contentModel: Model<Content> = {
    findByIdAndUpdate: jest.fn(),
  } as unknown as Model<Content>;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    contentService = new ContentService(contentModel);
    crawlerService = new CrawlerService();
    eventEmitter = new EventEmitter2();
    listener = new ContentUpdatedListener(
      crawlerService,
      contentService,
      eventEmitter
    );
    loggerErrorSpy = jest.spyOn(listener["logger"], "error");
  });

  describe("handleContentUpdatedEvent", () => {
    it("should crawl and update content when content exists", async () => {
      const contents = [
        { id: "contentId", link: "http://example.com" } as Content,
      ];
      jest
        .spyOn(contentService, "getContentsByAccountNameForCrawl")
        .mockResolvedValueOnce(contents);
      jest.spyOn(crawlerService, "crawl").mockResolvedValueOnce({
        url: "http://example.com",
        title: "Example Domain",
        description: "Example Domain for testing",
        image: "",
        keyword: "",
        raw_text: "",
      });
      const updateCrawlSpy = jest.spyOn(contentService, "updateCrawl");
      const emitSpy = jest.spyOn(eventEmitter, "emit");

      const event = new ContentUpdatedEvent("accountName");
      await listener.handleContentUpdatedEvent(event);

      expect(
        contentService.getContentsByAccountNameForCrawl
      ).toHaveBeenCalledWith(event.name);
      expect(crawlerService.crawl).toHaveBeenCalledWith(contents[0].link);
      expect(updateCrawlSpy).toHaveBeenCalledWith({
        id: contents[0].id,
        crawl: {
          url: "http://example.com",
          title: "Example Domain",
          description: "Example Domain for testing",
          image: "",
          keyword: "",
          raw_text: "",
          crawl_date: expect.any(Date),
        },
      });
      expect(emitSpy).toHaveBeenCalledWith(
        "crawl.finished",
        expect.any(CrawlFinishedEvent)
      );
    });

    it("should not crawl or update content when no content exists", async () => {
      const contents = [];
      jest
        .spyOn(contentService, "getContentsByAccountNameForCrawl")
        .mockResolvedValueOnce(contents);
      const crawlSpy = jest.spyOn(crawlerService, "crawl");
      const updateCrawlSpy = jest.spyOn(contentService, "updateCrawl");
      const emitSpy = jest.spyOn(eventEmitter, "emit");

      const event = new ContentUpdatedEvent("accountName");
      await listener.handleContentUpdatedEvent(event);

      expect(
        contentService.getContentsByAccountNameForCrawl
      ).toHaveBeenCalledWith(event.name);
      expect(crawlSpy).not.toHaveBeenCalled();
      expect(updateCrawlSpy).not.toHaveBeenCalled();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it("should throw error", async () => {
      jest
        .spyOn(contentService, "getContentsByAccountNameForCrawl")
        .mockRejectedValue(new Error("some error"));

      const event = new ContentUpdatedEvent("accountName");
      await listener.handleContentUpdatedEvent(event);
      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    });

    it("should not crawl or update content when no content exists", async () => {
      const contents = [{ id: 10 } as Content];
      jest
        .spyOn(contentService, "getContentsByAccountNameForCrawl")
        .mockResolvedValueOnce(contents);
      const crawlSpy = jest
        .spyOn(crawlerService, "crawl")
        .mockResolvedValueOnce(undefined);
      const updateCrawlSpy = jest.spyOn(contentService, "updateCrawl");
      const emitSpy = jest.spyOn(eventEmitter, "emit");

      const event = new ContentUpdatedEvent("accountName");
      await listener.handleContentUpdatedEvent(event);

      expect(
        contentService.getContentsByAccountNameForCrawl
      ).toHaveBeenCalledWith(event.name);
      expect(crawlSpy).toHaveBeenCalled();
      expect(updateCrawlSpy).toHaveBeenCalled();
      expect(emitSpy).not.toHaveBeenCalled();
      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
