export interface UpdateCrawlDto {
  readonly id: string;
  readonly crawl: {
    url: string;
    title: string;
    description: string;
    keyword: string;
    image: string;
    raw_text: string;
  };
}
