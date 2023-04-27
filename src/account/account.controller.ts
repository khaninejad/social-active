import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import Client, { auth } from "twitter-api-sdk";
import { AccountService } from "./account.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateAccountCredentialsDto } from "./dto/update-account-credentials.dto";
import configuration from "../app.const";
import { Account } from "./interfaces/account.interface";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller("account")
export class AccountController {
  private client: Client;
  private authClient: auth.OAuth2User;
  STATE = "my-state";
  constructor(private readonly accountService: AccountService) {
    this.authClient = new auth.OAuth2User({
      ...configuration.getTwitterEnv(),
      scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    });
    this.client = new Client(this.authClient);
  }

  @Get("/")
  @ApiOperation({ summary: "Get list of the accounts" })
  async all(
    @Query("page") page: string,
    @Query("items_per_page") items_per_page: string
  ): Promise<Account[]> {
    try {
      const allAccounts = await this.accountService.getAll();
      return allAccounts;
    } catch (error) {
      throw new HttpException(
        "Internal Server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("/account")
  async account(@Query("account") account: string): Promise<string> {
    try {
      if (account) {
        const currentAccount = await this.accountService.getAccount(account);
        this.authClient = new auth.OAuth2User({
          client_id: currentAccount.credentials.client_id,
          client_secret: currentAccount.credentials.client_secret,
          callback: currentAccount.credentials.callback,
          scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
        });
        this.client = new Client(this.authClient);
      }
      return this.accountService.getLoginUrl();
    } catch (error) {
      throw new HttpException(
        "Internal Server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("/login")
  async login(@Res() res): Promise<any> {
    const authUrl = this.authClient.generateAuthURL({
      code_challenge_method: "s256",
      state: this.STATE,
    });
    return res.redirect(authUrl);
  }

  @Get("/callback")
  async callback(
    @Query("code") code: string,
    @Query("state") state: string
  ): Promise<string> {
    try {
      if (state !== this.STATE) throw new Error("State is not valid");
      const token = await this.authClient.requestAccessToken(code as string);
      const my_user = await this.client.users.findMyUser();
      this.accountService.create({
        account: my_user.data.username,
        ...(token.token as CreateAccountDto),
      });
      return JSON.stringify(my_user);
    } catch (error) {
      Logger.debug(error);
      throw error;
    }
  }

  @Post("/feeds")
  async feeds(@Req() req): Promise<any> {
    const res = this.accountService.updateFeeds({
      account: req.username,
      feeds: [req.feeds],
    });
    return res;
  }

  @Post("/config")
  async config(@Req() req): Promise<any> {
    const res = this.accountService.updateConfig({
      account: req.username,
      config: { reminder: req.reminder },
    });
    return res;
  }

  @Post("/credentials")
  async credentials(
    @Body() updateAccountCredentialsDto: UpdateAccountCredentialsDto
  ): Promise<any> {
    const res = this.accountService.updateCredentials(
      updateAccountCredentialsDto
    );
    return res;
  }
}
