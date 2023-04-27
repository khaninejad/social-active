import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PageCrawledEvent } from "../../events/page-crawled.event";

@Injectable()
export class PageCrawledListener {
  private readonly logger = new Logger(PageCrawledListener.name);
  @OnEvent("page.crawled")
  handlePageCrawledEvent(event: PageCrawledEvent) {
    this.logger.log(`PageCrawledListener Listener started ${event}`);
  }
}
