import { Module } from "@nestjs/common";
import { OpenAIService } from "./openai.service";
import { DatabaseModule } from "../database/database.module";
import { CrawlFinishedListener } from "./listeners/crawler-finished.listener";
import { ContentService } from "../content/content.service";
import { contentsProviders } from "../content/content.providers";

@Module({
  imports: [DatabaseModule],
  providers: [
    OpenAIService,
    CrawlFinishedListener,
    ContentService,
    ...contentsProviders,
  ],
})
export class OpenaiModule {}
