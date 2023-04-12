import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { load } from "cheerio";
import { CrawlerDataDto } from "./dto/crawler-data.dto";

@Injectable()
export class CrawlerService {
  async crawl(url: string): Promise<CrawlerDataDto> {
    try {
      const ultimateUrl = await this.getFinalUrl(url);

      const htmlResponse = await axios.get(ultimateUrl);
      const html = htmlResponse.data;
      const $ = load(html);
      const crawled_data: CrawlerDataDto = {
        url: ultimateUrl,
        title: $("title").text(),
        description: $('meta[name="description"]').attr("content"),
        keyword: $('meta[name="keywords"]').attr("content"),
        image: $('meta[property="og:image"]').attr("content"),
        raw_text: $("body :not(script):not(style)").text().replace(/\s+/g, " "),
      };
      console.error(`${JSON.stringify(crawled_data)} crawled`);
      return crawled_data;
    } catch (error) {
      Logger.error(error);
    }
  }

  async getFinalUrl(url: string): Promise<string> {
    const response = await axios.get(url, {
      maxRedirects: 0,
      validateStatus: (status) => status >= 300 && status < 400,
    });
    if (url.startsWith("https://consent.google.com")) {
      url = new URLSearchParams(url.split("?")[1]).get("continue");
    }

    if (response.status === 302) {
      const redirectUrl = response.headers.location;
      return this.getFinalUrl(redirectUrl);
    } else {
      url = await this.extractGoogleNewsUrl(url);
      return url;
    }
  }

  private async extractGoogleNewsUrl(url: string): Promise<string | undefined> {
    if (url.startsWith("https://news.google.com/")) {
      const text = await this.crawlBody(url);
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = text.match(urlRegex);
      if (urls) {
        return urls[0].replace('"', "");
      }
      return undefined;
    }
    return url;
  }

  private async crawlBody(url: string): Promise<string> {
    try {
      const htmlResponse = await axios.get(url);
      const html = htmlResponse.data;
      const $ = load(html);
      return $("body").html();
    } catch (error) {
      Logger.error(error);
    }
  }
}
