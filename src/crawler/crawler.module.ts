import { Module } from "@nestjs/common";
import { ContentUpdatedListener } from "./listeners/content-updated.listener";
import { CrawlerService } from "./crawler.service";

@Module({
  providers: [ContentUpdatedListener, CrawlerService],
})
export class CrawlerModule {}
