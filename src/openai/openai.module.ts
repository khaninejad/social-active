import { Module } from "@nestjs/common";
import { OpenAIService } from "./openai.service";
import { DatabaseModule } from "src/database/database.module";
import { CrawlFinishedListener } from "./listeners/crawler-finished.listener";
import { ContentService } from "src/content/content.service";
import { contentsProviders } from "src/content/content.providers";

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
