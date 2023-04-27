import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { load } from "cheerio";
import { CrawlerDataDto } from "./dto/crawler-data.dto";

@Injectable()
export class CrawlerService {
  async crawl(url: string): Promise<CrawlerDataDto> {
    try {
      const ultimateUrl = await this.getFinalUrl(url);
      Logger.debug(ultimateUrl);

      const htmlResponse = await axios.get(ultimateUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        },
      });
      const html = htmlResponse.data;
      const $ = load(html);
      const crawled_data: CrawlerDataDto = {
        url: ultimateUrl,
        title: $("title").text(),
        description: $('meta[name="description"]').attr("content"),
        keyword: $('meta[name="keywords"]').attr("content"),
        image: $('meta[property="og:image"]').attr("content"),
        raw_text: $("p").text().replace(/\s+/g, " "),
      };
      Logger.log(`${ultimateUrl} is crawled`);
      return crawled_data;
    } catch (error) {
      Logger.error(`CrawlerService ${error}`);
    }
  }

  async getFinalUrl(url: string): Promise<string> {
    if (
      !url.startsWith("https://news.google.com/") &&
      !url.startsWith("https://consent.google.com")
    ) {
      return url;
    }
    if (url.startsWith("https://consent.google.com")) {
      url = new URLSearchParams(url.split("?")[1]).get("continue");
    }

    try {
      const response = await axios.get(url, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status <= 302;
        },
        withCredentials: true,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
          Cookie: "CONSENT=YES+cb.%s-14-p0.en+F+941;",
        },
      });

      if (response?.status === 302) {
        const redirectUrl = response.headers.location;
        return this.getFinalUrl(redirectUrl);
      } else {
        url = await this.extractGoogleNewsUrl(response.data);
        return url;
      }
    } catch (error) {
      Logger.error(error.code);
    }
  }

  async extractGoogleNewsUrl(
    response_data: string
  ): Promise<string | undefined> {
    if (response_data) {
      const urlRegex = /https?:\/\/[^\s"]+/g;
      const urls = response_data.match(urlRegex);
      if (urls) {
        const filteredUrls = urls.filter(
          (url) =>
            !url.includes("google.com") &&
            !url.includes("googleusercontent.com") &&
            !url.includes("gstatic.com") &&
            !url.includes("googleapis.com") &&
            !url.includes("google-analytics.com") &&
            !url.includes("w3.org")
        );
        return filteredUrls[filteredUrls.length - 1];
      }
      return undefined;
    }
  }
}
