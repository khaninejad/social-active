import { Module } from "@nestjs/common";
import { RssService } from "./rss.service";

@Module({
  providers: [RssService],
})
export class RssModule {}
