import { Injectable, Logger } from "@nestjs/common";
import { AccountService } from "src/account/account.service";
import Client, { auth } from "twitter-api-sdk";

@Injectable()
export class TwitterService {
  private client: Client;
  STATE = "my-state";
  private readonly logger = new Logger(TwitterService.name);
  constructor(private readonly accountService: AccountService) {}

  async tweet(account: string, text: string) {
    const currentAccount = await this.accountService.getAccount(account);
    const authClient = new auth.OAuth2User({
      client_id: currentAccount.credentials.client_id as string,
      client_secret: currentAccount.credentials.client_secret as string,
      callback: currentAccount.credentials.callback as string,
      scopes: ["users.read", "tweet.read", "offline.access", "tweet.write"],
      token: {
        access_token: currentAccount.access_token,
        refresh_token: currentAccount.refresh_token,
        expires_at: Number.parseInt(currentAccount.expires_at),
        token_type: "bearer",
        scope: "users.read,tweet.read,offline.access,tweet.write",
      },
    });

    this.logger.debug(`access_token: ${currentAccount.access_token}`);
    this.client = new Client(authClient);
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
