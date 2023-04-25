import { Test, TestingModule } from "@nestjs/testing";
import { CrawlerService } from "./crawler.service";
import { CrawlerDataDto } from "./dto/crawler-data.dto";
import { Logger } from "@nestjs/common";
import axios from "axios";
jest.mock("axios");

describe("CrawlerService", () => {
  let service: CrawlerService;

  beforeEach(async () => {
    jest.restoreAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrawlerService],
    }).compile();

    service = module.get<CrawlerService>(CrawlerService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should crawl a web page and extract data", async () => {
    const url = "https://bing.com";

    jest.spyOn(axios, "get").mockResolvedValue({
      data: `<html><head>
      <meta name="description" content="description" />
      <meta name="keywords" content="keywords" />
      <meta property="og:image" content="http://image.com" />
      </head><body><p>this ia paragraph</p><p>this ia paragraph2</p></body></html>`,
    });

    const result: CrawlerDataDto = await service.crawl(url);

    expect(result).toBeDefined();
    expect(result.url).toBe(url);
    expect(result.description).toBe("description");
    expect(result.image).toBe("http://image.com");
    expect(result.keyword).toBe("keywords");
    expect(result.raw_text).toBe("this ia paragraphthis ia paragraph2");
  });

  it("should log in case of error", async () => {
    const url = "https://bing.com";
    jest
      .spyOn(service, "getFinalUrl")
      .mockRejectedValue(new Error("some unknown error"));
    jest.spyOn(Logger, "error").mockImplementation();

    await service.crawl(url);

    expect(Logger.error).toHaveBeenCalledTimes(1);
    expect(Logger.error).toHaveBeenCalledWith(
      "CrawlerService Error: some unknown error"
    );
  });

  describe("getFinalUrl", () => {
    it("getFinalUrl valid for urls other than google response", async () => {
      const url = "http://url.com";
      const res = await service.getFinalUrl(url);

      expect(res).toBe(url);
    });

    it("getFinalUrl valid for google news urls", async () => {
      const url = "https://news.google.com/";
      jest.spyOn(axios, "get").mockResolvedValueOnce({
        status: 302,
        headers: {
          location: "http://example3.com",
        },
      });

      const res = await service.getFinalUrl(url);

      expect(res).toBe("http://example3.com");
    });

    it("getFinalUrl valid for google news urls", async () => {
      const url = "https://news.google.com/";
      jest.spyOn(axios, "get").mockResolvedValueOnce({
        status: 302,
        headers: {
          location: "http://example2.com",
        },
      });

      const res = await service.getFinalUrl(url);
      expect(axios.get).toHaveBeenCalledTimes(1);

      expect(res).toBe("http://example2.com");
    });

    it("getFinalUrl valid for google news urls blocked by consent", async () => {
      const url =
        "https://consent.google.com?continue=https://news.google.com/";
      jest.spyOn(axios, "get").mockResolvedValueOnce({
        status: 302,
        headers: {
          location: "http://example1.com",
        },
      });

      const res = await service.getFinalUrl(url);

      expect(res).toBe("http://example1.com");
    });

    it("getFinalUrl valid for google news urls", async () => {
      const url = "https://news.google.com/";

      jest.spyOn(axios, "get").mockResolvedValueOnce({
        status: 200,
        headers: {
          location: "http://example5.com",
        },
      });
      jest
        .spyOn(service, "extractGoogleNewsUrl")
        .mockResolvedValueOnce("http://example5.com");
      const res = await service.getFinalUrl(url);

      expect(res).toBe("http://example5.com");
    });
  });
  describe("extractGoogleNewsUrl", () => {
    it("extractGoogleNewsUrl valid response", async () => {
      const url = "https://originallink.com";
      jest.spyOn(axios, "get").mockResolvedValueOnce({
        status: 200,
        data: '<html><body><p>this is a text<a href="https://originallink.com">this is a link</a></p></body></html',
      });

      const res = await service.extractGoogleNewsUrl(
        `<html><body><p>this is a text<a href="https://originallink.com">this is a link</a></p></body></html`
      );

      expect(res).toBe(url);
    });

    it("extractGoogleNewsUrl with non-google links response", async () => {
      const url = "https://example.com/";
      const res = await service.extractGoogleNewsUrl(url);

      expect(res).toBe("https://example.com/");
    });

    it("extractGoogleNewsUrl valid no links", async () => {
      const url = "https://news.google.com/";
      jest.spyOn(axios, "get").mockResolvedValueOnce({
        status: 200,
        data: `<html><body><p>this is a text </p><a href="${url}">link</a></body></html`,
      });

      const res = await service.extractGoogleNewsUrl(url);

      expect(res).toBe(undefined);
    });

    it("extractGoogleNewsUrl failed response", async () => {
      const url = "this is a content";
      jest.spyOn(axios, "get").mockRejectedValue(new Error());

      const res = await service.extractGoogleNewsUrl(url);

      expect(res).toBeUndefined();
    });

    it("getFinalUrl valid for urls other than google response 2", async () => {
      jest.spyOn(axios, "get").mockResolvedValueOnce({
        status: 200,
        data: '<html><body><p>this is a text </p><a href="https://www.npr.org/2023/04/23/1171340024/succession-recap-season-4-episode-5-kill-list"">open</a></body></html',
      });
      const url =
        "https://news.google.com/rss/articles/CBMiV2h0dHBzOi8vd3d3Lm5wci5vcmcvMjAyMy8wNC8yMy8xMTcxMzQwMDI0L3N1Y2Nlc3Npb24tcmVjYXAtc2Vhc29uLTQtZXBpc29kZS01LWtpbGwtbGlzdNIBAA?oc=5";
      const res = await service.getFinalUrl(url);

      expect(res).toBe(
        "https://www.npr.org/2023/04/23/1171340024/succession-recap-season-4-episode-5-kill-list"
      );
    });
  });
});
