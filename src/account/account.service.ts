import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { ACCOUNT_MODEL } from "../app.const";
import { Account } from "./interfaces/account.interface";
import { CreateAccountDto } from "./dto/create-account.dto";

@Injectable()
export class AccountService {
  constructor(
    @Inject(ACCOUNT_MODEL)
    private accountModel: Model<Account>
  ) {}

  getLoginUrl(): string {
    return `Follow the link for <a href="${process.env.LOGIN_URL}">login</a>`;
  }

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const createdAccount = await this.accountModel.create(createAccountDto);
    return createdAccount;
  }
}
