import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { DatabaseModule } from "src/database/database.module";
import { accountsProviders } from "./content.providers";

@Module({
  imports: [DatabaseModule],
  controllers: [AccountController],
  providers: [AccountService, ...accountsProviders],
  exports: [AccountService],
})
export class AccountModule {}
