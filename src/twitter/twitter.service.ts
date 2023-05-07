import { Injectable, Logger } from "@nestjs/common";
import { AccountService } from "../account/account.service";
import Client, { auth } from "twitter-api-sdk";
import { CreateAccountDto } from "src/account/dto/create-account.dto";

@Injectable()
export class TwitterService {
  private client: Client;
  STATE = "my-state";
  private readonly logger = new Logger(TwitterService.name);
  constructor(private readonly accountService: AccountService) {}

  async tweet(account: string, text: string) {
    try {
      const authClient = await this.getAuthClient(account);
      return await this.sendTweet(authClient, text);
    } catch (error) {
      this.logger.error(`tweet ${JSON.stringify(error as Error)}`);
    }
  }

  private async getAuthClient(account: string) {
    try {
      const currentAccount = await this.accountService.getAccount(account);
      const authClient = new auth.OAuth2User({
        client_id: currentAccount.credentials.TWITTER_CLIENT_ID,
        client_secret: currentAccount.credentials.TWITTER_CLIENT_SECRET,
        callback: currentAccount.credentials.callback,
        scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
        token: {
          access_token: currentAccount.access_token,
          refresh_token: currentAccount.refresh_token,
        },
      });
      if (!authClient.isAccessTokenExpired()) {
        return authClient;
      } else {
        this.logger.error("access token is expired");
        const token = await authClient.refreshAccessToken();
        const updateAccount = { account, ...token.token };
        this.accountService.updateToken(updateAccount as CreateAccountDto);
        return authClient;
      }
    } catch (error) {
      this.logger.error(`getAuthClient ${JSON.stringify(error as Error)}`);
    }
  }

  private async sendTweet(authClient: auth.OAuth2User, text: string) {
    this.client = new Client(authClient);
    this.logger.log(`tweet: ${text}`);

    const tweet = await this.client.tweets.createTweet({
      text: text,
    });
    return tweet;
  }
}
