import { Module } from "@nestjs/common";
import { ContentService } from "./content.service";
import { DatabaseModule } from "src/database/database.module";
import { contentsProviders } from "./content.providers";

@Module({
  imports: [DatabaseModule],
  providers: [ContentService, ...contentsProviders],
  exports: [ContentService],
})
export class ContentModule {}
