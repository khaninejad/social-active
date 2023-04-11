import { Controller, Get, Query, Res } from "@nestjs/common";
import Client, { auth } from "twitter-api-sdk";
import { AccountService } from "./account.service";
import { CreateAccountDto } from "./dto/create-account.dto";

@Controller("account")
export class AccountController {
  private client: Client;
  private authClient: auth.OAuth2User;
  STATE = "my-state";
  constructor(private readonly accountService: AccountService) {
    this.authClient = new auth.OAuth2User({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      callback: process.env.CLIENT_CALLBACK,
      scopes: ["tweet.read", "users.read", "offline.access"],
    });
    this.client = new Client(this.authClient);
  }

  @Get("/")
  account(): string {
    return this.accountService.getLoginUrl();
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
      console.error(error);
      throw error;
    }
  }
}