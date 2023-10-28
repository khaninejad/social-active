import { Module } from "@nestjs/common";
import { RssModule } from "./rss/rss.module";
import { ContentModule } from "./content/content.module";
import { AccountModule } from "./account/account.module";
import { DatabaseModule } from "./database/database.module";
import { ScheduleModule } from "@nestjs/schedule";
import { TaskService } from "./task/task.service";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { CrawlerModule } from "./crawler/crawler.module";
import { WordpressModule } from "./wordpress/wordpress.module";
import { OpenaiModule } from "./openai/openai.module";
import { TwitterModule } from "./twitter/twitter.module";
import { InstagramModule } from "./instagram/instagram.module";

@Module({
  imports: [
    DatabaseModule,
    RssModule,
    ContentModule,
    AccountModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    CrawlerModule,
    WordpressModule,
    OpenaiModule,
    TwitterModule,
    InstagramModule,
  ],
  controllers: [],
  providers: [TaskService],
})
export class AppModule {}
