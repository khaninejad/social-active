export class PageCrawledEvent {
  url: string;
  title: string;
  description: string;
  keyword: string;
  image: string;
  raw_text: string;
  constructor(
    url: string,
    title: string,
    description: string,
    keyword: string,
    image: string,
    raw_text: string
  ) {
    this.url = url;
    this.title = title;
    this.description = description;
    this.keyword = keyword;
    this.image = image;
    this.raw_text = raw_text;
  }
}
