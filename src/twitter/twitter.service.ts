import { Injectable, Logger } from "@nestjs/common";
import { AccountService } from "../account/account.service";
import Client from "twitter-api-sdk";

@Injectable()
export class TwitterService {
  private client: Client;
  STATE = "my-state";
  private readonly logger = new Logger(TwitterService.name);
  constructor(private readonly accountService: AccountService) {}

  async tweet(account: string, text: string) {
    const currentAccount = await this.accountService.getAccount(account);
    this.logger.debug(`access_token: ${currentAccount.access_token}`);
    this.client = new Client(currentAccount.access_token);
    this.logger.log(`tweet: ${text}`);
    try {
      const tweet = await this.client.tweets.createTweet({
        text: text,
      });
      return tweet;
    } catch (error) {
      console.error(error);
      this.logger.error(error);
      this.logger.error(error.message);
      console.log(`${JSON.stringify(error as Error)}`);
    }
  }
}
