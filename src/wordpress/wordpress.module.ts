import { Module } from "@nestjs/common";
import { WordpressService } from "./wordpress.service";
import { CrawlFinishedListener } from "./listeners/generation-finished.listener";
import { contentsProviders } from "../content/content.providers";
import { ContentService } from "../content/content.service";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [DatabaseModule],
  providers: [
    WordpressService,
    CrawlFinishedListener,
    ContentService,
    ...contentsProviders,
  ],
})
export class WordpressModule {}
