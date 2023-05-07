import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { ACCOUNT_MODEL } from "../app.const";
import { Account } from "./interfaces/account.interface";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateAccountFeedDto } from "./dto/update-account-feed.dto";
import { UpdateAccountConfigDto } from "./dto/update-account-config.dto";
import { UpdateAccountCredentialsDto } from "./dto/update-account-credentials.dto";

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
    const createdAccount = this.accountModel.findOneAndUpdate(
      { account: createAccountDto.account },
      {
        ...createAccountDto,
        feeds: createAccountDto.feeds.split("\n"),
      },
      { upsert: true }
    );
    return createdAccount;
  }

  async updateFeeds(
    updateAccountFeedDto: UpdateAccountFeedDto
  ): Promise<Account> {
    const updated = this.accountModel.findOneAndUpdate(
      { account: updateAccountFeedDto.account },
      updateAccountFeedDto,
      { upsert: true }
    );
    return updated;
  }

  updateConfig(
    updateAccountConfigDto: UpdateAccountConfigDto
  ): Promise<Account> {
    const updated = this.accountModel.findOneAndUpdate(
      { account: updateAccountConfigDto.account },
      updateAccountConfigDto,
      { upsert: true }
    );
    return updated;
  }

  async updateCredentials(
    updateAccountCredentialsDto: UpdateAccountCredentialsDto
  ): Promise<Account> {
    const updated = this.accountModel.findOneAndUpdate(
      { account: updateAccountCredentialsDto.account },
      updateAccountCredentialsDto,
      { upsert: true }
    );
    return updated;
  }

  async getAll(): Promise<Account[]> {
    return this.accountModel.find().exec();
  }
  getAccount(account: string): Promise<Account> {
    return this.accountModel.findOne({ account: account }).exec();
  }
  updateToken(token: CreateAccountDto) {
    const updated = this.accountModel.findOneAndUpdate(
      { account: token.account },
      token,
      { upsert: true }
    );
    return updated;
  }
}
