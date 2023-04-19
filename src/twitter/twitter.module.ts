import { Module } from "@nestjs/common";
import { TwitterService } from "./twitter.service";
import { WordpressPublishedListener } from "./listeners/wordpress-published.listener";
import { DatabaseModule } from "src/database/database.module";
import { AccountService } from "src/account/account.service";
import { accountsProviders } from "src/account/content.providers";
import { ContentService } from "src/content/content.service";
import { contentsProviders } from "src/content/content.providers";

@Module({
  imports: [DatabaseModule],
  providers: [
    TwitterService,
    WordpressPublishedListener,
    AccountService,
    ContentService,
    ...accountsProviders,
    ...contentsProviders,
  ],
})
export class TwitterModule {}
