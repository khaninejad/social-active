import { Module } from "@nestjs/common";
import { InstagramService } from "./instagram.service";
import { InstagramController } from "./instagram.controller";
import { DatabaseModule } from "src/database/database.module";
import { instagramProviders } from "./instagram.providers";

@Module({
  imports: [DatabaseModule],
  controllers: [InstagramController],
  providers: [InstagramService, ...instagramProviders],
})
export class InstagramModule {}
