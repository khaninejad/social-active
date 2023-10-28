import { Module } from "@nestjs/common";
import { OpenAIService } from "./openai.service";
import { DatabaseModule } from "../database/database.module";
import { CrawlFinishedListener } from "./listeners/crawler-finished.listener";
import { ContentService } from "../content/content.service";
import { contentsProviders } from "../content/content.providers";
import { TwitterService } from "../twitter/twitter.service";
import { accountsProviders } from "../account/content.providers";
import { AccountService } from "../account/account.service";

@Module({
  imports: [DatabaseModule],
  providers: [
    OpenAIService,
    TwitterService,
    CrawlFinishedListener,
    AccountService,
    ...accountsProviders,
    ContentService,
    ...contentsProviders,
  ],
})
export class OpenaiModule {}
