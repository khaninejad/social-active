import { Module } from "@nestjs/common";
import { ContentUpdatedListener } from "./listeners/content-updated.listener";

@Module({
  providers: [ContentUpdatedListener],
})
export class CrawlerModule {}
