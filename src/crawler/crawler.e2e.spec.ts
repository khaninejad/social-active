//https://news.google.com/rss/articles/CBMiVWh0dHBzOi8vd3d3Lndhc2hpbmd0b25wb3N0LmNvbS9oZWFsdGgvMjAyMy8wNC8yNC9hbHpoZWltZXJzLWVhcmx5LXN5bXB0b21zLXRyZWF0bWVudC_SAQA?oc=5

import { CrawlerService } from "./crawler.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("crawlerService", () => {
  let service: CrawlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrawlerService],
    }).compile();

    service = module.get<CrawlerService>(CrawlerService);
  });

  describe("e2e", () => {
    it("test google news", async () => {
      const res = await service.getFinalUrl(
        "https://news.google.com/rss/articles/CBMiVWh0dHBzOi8vd3d3Lndhc2hpbmd0b25wb3N0LmNvbS9oZWFsdGgvMjAyMy8wNC8yNC9hbHpoZWltZXJzLWVhcmx5LXN5bXB0b21zLXRyZWF0bWVudC_SAQA?oc=5"
      );
      expect(res).toBe(
        "https://www.washingtonpost.com/health/2023/04/24/alzheimers-early-symptoms-treatment/"
      );
    });
  });
});
