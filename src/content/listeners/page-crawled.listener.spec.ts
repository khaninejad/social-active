import { PageCrawledEvent } from "../../events/page-crawled.event";
import { PageCrawledListener } from "./page-crawled.listener";

const eventMock = new PageCrawledEvent(
  "http://example.com",
  "title",
  "description",
  "keyword",
  "http://google.com",
  "text"
);

describe("PageCrawledListener", () => {
  let listener: PageCrawledListener;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    listener = new PageCrawledListener();
    loggerSpy = jest.spyOn(listener["logger"], "log");
  });

  describe("check definition", () => {
    it("definition", () => {
      expect(eventMock).toBeDefined();
    });
  });

  describe("handlePageCrawledEvent", () => {
    it("check handlePageCrawledEvent is triggered", () => {
      listener.handlePageCrawledEvent(eventMock);
      expect(loggerSpy).toHaveBeenCalledTimes(1);
    });
  });
});
