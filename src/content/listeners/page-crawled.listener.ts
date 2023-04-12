import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PageCrawledEvent } from "../../events/page-crawled.event";
import { ContentService } from "../content.service";

@Injectable()
export class PageCrawledListener {
  constructor(private readonly contentService: ContentService) {}
  @OnEvent("page.crawled")
  handlePageCrawledEvent(event: PageCrawledEvent) {
    Logger.debug(`PageCrawledListener Listener started ${event}`);
  }
}
