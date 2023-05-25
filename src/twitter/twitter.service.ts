import { Injectable, Logger } from "@nestjs/common";
import { AccountService } from "../account/account.service";
import Client, { auth } from "twitter-api-sdk";
import { UpdateAccountTokenDto } from "src/account/dto/update-account-token.dto";

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
      let currentAccount;
      if (this.isMongoId(account)) {
        currentAccount = await this.accountService.getAccountById(account);
      } else {
        currentAccount = await this.accountService.getAccountByName(account);
      }

      const authClient = new auth.OAuth2User({
        client_id: currentAccount.credentials.client_id,
        client_secret: currentAccount.credentials.client_secret,
        callback: currentAccount.credentials.callback,
        scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
        token: {
          access_token: currentAccount.token.access_token,
          refresh_token: currentAccount.token.refresh_token,
          expires_at: +currentAccount.token.expires_at,
          scope: currentAccount.token.scope,
          token_type: currentAccount.token.token_type,
        },
      });
      if (!authClient.isAccessTokenExpired()) {
        return authClient;
      } else {
        this.logger.error("access token is expired");
        const token = await authClient.refreshAccessToken();
        const updateAccount = {
          account: currentAccount.account,
          token: { ...token.token },
        };
        await this.accountService.updateToken(
          updateAccount as UpdateAccountTokenDto
        );
        return authClient;
      }
    } catch (error) {
      this.logger.error(`getAuthClient ${JSON.stringify(error as Error)}`);
    }
  }

  private async sendTweet(authClient: auth.OAuth2User, text: string) {
    try {
      this.client = await this.getClientInstance(authClient);
      this.logger.log(`tweet: ${text}`);

      const tweet = await this.client.tweets.createTweet({
        text: text,
      });
      return tweet;
    } catch (error) {
      this.logger.error(`sendTweet sendTweet ${JSON.stringify(error)}`);
    }
  }

  async getClientInstance(authClient: auth.OAuth2User): Promise<Client> {
    return new Promise((resolve) => {
      const client = new Client(authClient);
      resolve(client);
    });
  }

  async refreshAccount(account: string) {
    try {
      const authClient = await this.getAuthClient(account);
      return await this.sendRefreshAccount(authClient);
    } catch (error) {
      this.logger.error(`tweet ${JSON.stringify(error as Error)}`);
    }
  }

  private async sendRefreshAccount(authClient: auth.OAuth2User) {
    try {
      this.client = await this.getClientInstance(authClient);

      const my_user = await this.client.users.findMyUser({
        "user.fields": [
          "description",
          "profile_image_url",
          "id",
          "username",
          "name",
          "url",
          "created_at",
          "location",
          "verified",
          "public_metrics",
        ],
      });
      return my_user;
    } catch (error) {
      this.logger.error(`refresh Account ${JSON.stringify(error)}`);
    }
  }

  isMongoId(str: string): boolean {
    return /^[0-9a-f]{24}$/.test(str);
  }
}
