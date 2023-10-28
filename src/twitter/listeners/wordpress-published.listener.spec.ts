import { ContentService } from "../../content/content.service";
import { Model, Schema } from "mongoose";
import { Content } from "../../content/interfaces/content.interface";
import { GenerationFinishedEvent } from "../../events/generation-finished.event";
import { TwitterService } from "../twitter.service";
import { WordpressPublishedListener } from "./wordpress-published.listener";
import { AccountService } from "../../account/account.service";
import { Account } from "../../account/interfaces/account.interface";

const mongooseObjectId = new Schema.Types.ObjectId("123456");
const generationFinishedEventMock = new GenerationFinishedEvent(
  mongooseObjectId
);

describe("handleWordpressPublishedEvent", () => {
  let contentService: ContentService;
  let accountService: AccountService;
  let twitterService: TwitterService;

  let listener: WordpressPublishedListener;
  const contentModel: Model<Content> = {
    findByIdAndUpdate: jest.fn(),
  } as unknown as Model<Content>;

  const accountModel: Model<Account> = {
    findByIdAndUpdate: jest.fn(),
  } as unknown as Model<Account>;
  let loggerSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    contentService = new ContentService(contentModel);
    accountService = new AccountService(accountModel);
    twitterService = new TwitterService(accountService);
    listener = new WordpressPublishedListener(contentService, twitterService);
    loggerSpy = jest.spyOn(listener["logger"], "log");
    loggerWarnSpy = jest.spyOn(listener["logger"], "warn");
    loggerErrorSpy = jest.spyOn(listener["logger"], "error");
  });

  describe("handleGenerationFinishedEvent", () => {
    it("should throw error", async () => {
      jest
        .spyOn(contentService, "getContentById")
        .mockRejectedValue(new Error("some error"));
      jest.spyOn(twitterService, "tweet").mockImplementation();

      await listener.handleWordpressPublishedEvent(generationFinishedEventMock);
      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    });

    it("check handleWordpressPublishedEvent is triggered", async () => {
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
        blog: {
          title: "blog title",
          link: "http://example.com",
        },
      } as Content);
      jest.spyOn(twitterService, "tweet").mockResolvedValue({
        data: {
          id: "1234",
          text: "ok",
        },
      });

      await listener.handleWordpressPublishedEvent(generationFinishedEventMock);
      expect(loggerSpy).toHaveBeenCalledTimes(2);
      expect(loggerWarnSpy).toHaveBeenCalledTimes(0);
      expect(loggerSpy).toHaveBeenCalledWith("Listener Finished");
    });
  });
});
