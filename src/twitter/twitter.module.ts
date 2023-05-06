import { Module } from "@nestjs/common";
import { TwitterService } from "./twitter.service";
import { WordpressPublishedListener } from "./listeners/wordpress-published.listener";
import { DatabaseModule } from "../database/database.module";
import { AccountService } from "../account/account.service";
import { ContentService } from "../content/content.service";
import { accountsProviders } from "../account/content.providers";
import { contentsProviders } from "../content/content.providers";

@Module({
  imports: [DatabaseModule],
  providers: [
    TwitterService,
    WordpressPublishedListener,
    AccountService,
    ...accountsProviders,
    ContentService,
    ...contentsProviders,
  ],
})
export class TwitterModule {}
