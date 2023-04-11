import { Module } from "@nestjs/common";
import { RssModule } from "./rss/rss.module";
import { ContentModule } from "./content/content.module";
import { AccountModule } from "./account/account.module";
import { DatabaseModule } from "./database/database.module";
import { ScheduleModule } from "@nestjs/schedule";
import { TaskService } from "./task/task.service";

@Module({
  imports: [
    DatabaseModule,
    RssModule,
    ContentModule,
    AccountModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [TaskService],
})
export class AppModule {}
