import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RssModule } from "./rss/rss.module";
import { ContentModule } from "./content/content.module";

@Module({
  imports: [RssModule, ContentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
