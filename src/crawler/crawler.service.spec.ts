import { Test, TestingModule } from "@nestjs/testing";
import { CrawlerService } from "./crawler.service";
import { CrawlerDataDto } from "./dto/crawler-data.dto";

describe("CrawlerService", () => {
  let service: CrawlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrawlerService],
    }).compile();

    service = module.get<CrawlerService>(CrawlerService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should crawl a web page and extract data", async () => {
    const url =
      "https://news.google.com/rss/articles/CBMiVmh0dHBzOi8vd3d3LmNubi5jb20vMjAyMy8wNC8xMS91cy9sb3Vpc3ZpbGxlLWtlbnR1Y2t5LWJhbmstc2hvb3RpbmctdHVlc2RheS9pbmRleC5odG1s0gFaaHR0cHM6Ly9hbXAuY25uLmNvbS9jbm4vMjAyMy8wNC8xMS91cy9sb3Vpc3ZpbGxlLWtlbnR1Y2t5LWJhbmstc2hvb3RpbmctdHVlc2RheS9pbmRleC5odG1s?oc=5";

    const result: CrawlerDataDto = await service.crawl(url);

    expect(result).toBeDefined();
    expect(result.url).toBeTruthy();
    expect(result.description).toBeTruthy();
    expect(result.image).toBeTruthy();
    expect(result.raw_text).toBeTruthy();
  });
});
