import { EventEmitter2 } from "@nestjs/event-emitter";
import { ContentService } from "../../content/content.service";
import { Model, Schema } from "mongoose";
import { Content } from "../../content/interfaces/content.interface";
import { CrawlFinishedListener } from "./generation-finished.listener";
import { WordpressService } from "../wordpress.service";
import { GenerationFinishedEvent } from "../../events/generation-finished.event";
import { WordpressResponse } from "../dto/wordpress-response.dto";

const mongooseObjectId = new Schema.Types.ObjectId("123456");
const generationFinishedEventMock = new GenerationFinishedEvent(
  mongooseObjectId
);

describe("GenerationFinishedListener", () => {
  let contentService: ContentService;
  let wordpressService: WordpressService;
  let eventEmitter: EventEmitter2;
  let listener: CrawlFinishedListener;
  const contentModel: Model<Content> = {
    findByIdAndUpdate: jest.fn(),
  } as unknown as Model<Content>;
  let loggerSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;
  process.env.WORDPRESS_ENDPOINT = "http://ok.com";
  process.env.WORDPRESS_USERNAME = "username";
  process.env.WORDPRESS_PASSWORD = "password";

  beforeEach(() => {
    eventEmitter = {
      emit: jest.fn(),
    } as unknown as EventEmitter2;
    contentService = new ContentService(contentModel);
    wordpressService = new WordpressService();
    listener = new CrawlFinishedListener(
      wordpressService,
      eventEmitter,
      contentService
    );
    loggerSpy = jest.spyOn(listener["logger"], "log");
    loggerWarnSpy = jest.spyOn(listener["logger"], "warn");
    loggerErrorSpy = jest.spyOn(listener["logger"], "error");
  });

  describe("handleGenerationFinishedEvent", () => {
    it("should throw error", async () => {
      jest
        .spyOn(contentService, "getContentById")
        .mockRejectedValue(new Error("some error"));
      jest.spyOn(wordpressService, "createPost").mockImplementation();

      await listener.handleGenerationFinishedEvent(generationFinishedEventMock);
      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    });

    it("check handleGenerationFinishedEvent is triggered", async () => {
      jest.spyOn(contentService, "getContentById").mockResolvedValue({
        id: "123456",
        title: "title",
        description: "description",
        crawl: {
          image: "http://google.com",
        },
        generated: {
          title: "title",
          body: "body",
          tags: "tags",
          category: "category",
        },
      } as Content);
      jest.spyOn(wordpressService, "createPost").mockResolvedValue({
        id: "123",
        title: { raw: "title" },
        link: "http://example.com",
        slug: "test-slug",
        date: new Date(),
      } as unknown as WordpressResponse);

      await listener.handleGenerationFinishedEvent(generationFinishedEventMock);
      expect(loggerSpy).toHaveBeenCalledTimes(3);
      expect(loggerWarnSpy).toHaveBeenCalledTimes(0);
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });

    it("check handleGenerationFinishedEvent contain source url", async () => {
      jest.spyOn(contentService, "getContentById").mockResolvedValue({
        id: "123456",
        title: "title",
        description: "description",
        crawl: {
          image: "http://google.com",
          url: "http://test.ecom",
        },
        generated: {
          title: "title",
          body: "body",
          tags: "tags",
          category: "category",
        },
      } as Content);
      jest.spyOn(wordpressService, "createPost").mockResolvedValue({
        id: "123",
        title: { raw: "title" },
        link: "http://example.com",
        slug: "test-slug",
        date: new Date(),
      } as unknown as WordpressResponse);

      await listener.handleGenerationFinishedEvent(generationFinishedEventMock);
      expect(wordpressService.createPost).toHaveBeenCalledWith(
        "title",
        `body\n<a href="http://test.ecom">Source</a>`,
        "http://google.com",
        ["category"],
        ["tags"]
      );
    });

    it("check handleGenerationFinishedEvent not contain source url", async () => {
      const contentMock = {
        id: "123456",
        title: "title",
        description: "description",
        crawl: {
          image: "http://google.com",
          url: "http://test.ecom",
        },
        generated: {
          title: "title",
          body: `body\n<a href="http://test.ecom">visit this link</a>`,
          tags: "tags",
          category: "category",
        },
      } as Content;
      jest
        .spyOn(contentService, "getContentById")
        .mockResolvedValue(contentMock);
      jest.spyOn(wordpressService, "createPost").mockResolvedValue({
        id: "123",
        title: { raw: "title" },
        link: "http://example.com",
        slug: "test-slug",
        date: new Date(),
      } as unknown as WordpressResponse);

      await listener.handleGenerationFinishedEvent(generationFinishedEventMock);
      expect(wordpressService.createPost).toHaveBeenCalledWith(
        "title",
        contentMock.generated.body,
        contentMock.crawl.image,
        ["category"],
        ["tags"]
      );
    });
  });
});
