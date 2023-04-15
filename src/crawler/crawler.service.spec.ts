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
    const url = "https://bing.com";

    const result: CrawlerDataDto = await service.crawl(url);

    expect(result).toBeDefined();
    expect(result.url).toBeTruthy();
    expect(result.description).toBeTruthy();
    expect(result.image).toBeTruthy();
  });
});
