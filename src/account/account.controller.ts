import { Controller, Get, Query, Res } from "@nestjs/common";
import { auth } from "twitter-api-sdk";
import { AccountService } from "./account.service";
import { randomUUID } from "crypto";

@Controller("account")
export class AccountController {
  private client: auth.OAuth2User;
  constructor(private readonly accountService: AccountService) {
    this.client = new auth.OAuth2User({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      callback: process.env.CLIENT_CALLBACK,
      scopes: ["tweet.read", "users.read", "offline.access"],
    });
  }

  @Get("/")
  async account(@Res() res): Promise<any> {
    return this.accountService.getLoginUrl();
  }

  @Get("/login")
  async login(@Res() res): Promise<any> {
    const authUrl = this.client.generateAuthURL({
      code_challenge_method: "s256",
      state: randomUUID(),
    });
    return res.redirect(authUrl);
  }

  @Get("/callback")
  async callback(@Query("code") code: string): Promise<any> {
    try {
      return await this.client.requestAccessToken(code);
    } catch (error) {
      console.error(error);
    }
  }
}
