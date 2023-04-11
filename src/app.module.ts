import { Module } from "@nestjs/common";
import { RssModule } from "./rss/rss.module";
import { ContentModule } from "./content/content.module";
import { AccountModule } from "./account/account.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [DatabaseModule, RssModule, ContentModule, AccountModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
