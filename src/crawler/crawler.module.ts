import { Module } from "@nestjs/common";
import { ContentUpdatedListener } from "./listeners/content-updated.listener";
import { CrawlerService } from "./crawler.service";
import { ContentService } from "../content/content.service";
import { DatabaseModule } from "../database/database.module";
import { contentsProviders } from "../content/content.providers";

@Module({
  imports: [DatabaseModule],
  providers: [
    ContentUpdatedListener,
    CrawlerService,
    ContentService,
    ...contentsProviders,
  ],
  exports: [CrawlerService],
})
export class CrawlerModule {}
