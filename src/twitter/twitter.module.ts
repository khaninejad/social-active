import { Module } from "@nestjs/common";
import { TwitterService } from "./twitter.service";
import { WordpressPublishedListener } from "./listeners/wordpress-published.listener";
import { DatabaseModule } from "../database/database.module";
import { AccountService } from "../account/account.service";
import { ContentService } from "../content/content.service";

@Module({
  imports: [DatabaseModule],
  providers: [
    TwitterService,
    WordpressPublishedListener,
    AccountService,
    ContentService,
  ],
})
export class TwitterModule {}
