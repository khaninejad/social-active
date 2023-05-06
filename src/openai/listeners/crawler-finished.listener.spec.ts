import { EventEmitter2 } from "@nestjs/event-emitter";
import { ContentService } from "../../content/content.service";
import { Model, Schema } from "mongoose";
import { Content } from "../../content/interfaces/content.interface";
import { CrawlFinishedListener } from "./crawler-finished.listener";
import { OpenAIService } from "../openai.service";
import { CrawlFinishedEvent } from "../../events/crawl-finished.event";
import { GeneratedBlogDto } from "../dto/generated-blog.dto";

const mongooseObjectId = new Schema.Types.ObjectId("123456");
const crawlFinishedEventMock = new CrawlFinishedEvent(mongooseObjectId);
process.env.OPENAI_API_KEY = "api-key";
process.env.OPENAI_MAX_TOKEN = "1234";

describe("ContentUpdatedListener", () => {
  let contentService: ContentService;
  let openAIService: OpenAIService;
  let eventEmitter: EventEmitter2;
  let listener: CrawlFinishedListener;
  const contentModel: Model<Content> = {
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  } as unknown as Model<Content>;
  let loggerSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    eventEmitter = {
      emit: jest.fn(),
    } as unknown as EventEmitter2;

    contentService = new ContentService(contentModel);
    openAIService = new OpenAIService();

    listener = new CrawlFinishedListener(
      openAIService,
      contentService,
      eventEmitter
    );
    loggerSpy = jest.spyOn(listener["logger"], "log");
    loggerWarnSpy = jest.spyOn(listener["logger"], "warn");
    loggerErrorSpy = jest.spyOn(listener["logger"], "error");

    process.env.OPENAI_MAX_TOKEN = "1500";
    process.env.OPENAI_API_KEY = "api-key";
  });

  describe("CrawlFinishedListener", () => {
    it("check service is defined", () => {
      expect(listener).toBeDefined();
    });

    it("check CrawlFinishedListener is triggered", async () => {
      jest.spyOn(contentService, "getContentById").mockResolvedValue({
        id: "123456",
        title: "title",
        description: "description",
        crawl: {
          title: "title",
          description: "description",
          url: "http://google.com",
          raw_text: "raw",
          keyword: "keyword",
        },
      } as Content);
      jest.spyOn(openAIService, "generateText").mockResolvedValue({
        body: "generated body",
        category: "generated cat",
        title: "generated title",
        tags: "generated tags",
      } as GeneratedBlogDto);

      await listener.handleCrawlFinishedEvent(crawlFinishedEventMock);
      expect(loggerSpy).toHaveBeenCalledTimes(4);
      expect(loggerWarnSpy).toHaveBeenCalledTimes(2);
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });

    it("check CrawlFinishedListener throws error", async () => {
      jest
        .spyOn(contentService, "getContentById")
        .mockRejectedValue(new Error("error"));

      await listener.handleCrawlFinishedEvent(crawlFinishedEventMock);
      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    });

    it("CrawlFinishedListener max token throws error", async () => {
      jest.spyOn(contentService, "getContentById").mockResolvedValue({
        id: "123456",
        title: "title",
        description: "description",
        crawl: {
          title: "title",
          description: "description",
          url: "http://google.com",
          raw_text: "raw",
          keyword: "keyword",
        },
      } as Content);
      process.env.OPENAI_MAX_TOKEN = "150";

      await listener.handleCrawlFinishedEvent(crawlFinishedEventMock);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        "handleCrawlFinishedEvent Error: You have reached the max token"
      );
    });
  });
});
