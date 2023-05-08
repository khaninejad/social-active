import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Put,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import Client, { auth } from "twitter-api-sdk";
import { AccountService } from "./account.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateAccountCredentialsDto } from "./dto/update-account-credentials.dto";
import configuration from "../app.const";
import { Account } from "./interfaces/account.interface";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { LoginRequestDto } from "./dto/login-request.dto";
import { LoginVerifyTokenDto } from "./dto/login-verify-token.dto";
import { UpdateAccountTokenDto } from "./dto/update-account-token.dto";

@Controller("account")
export class AccountController {
  private client: Client;
  private authClient: auth.OAuth2User;
  STATE = "my-state";
  private readonly logger: Logger = new Logger(AccountController.name);
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
  async account(
    @Query("account") account: string,
    @Res() res?
  ): Promise<string> {
    try {
      if (account) {
        const currentAccount = await this.accountService.getAccount(account);
        this.logger.debug(currentAccount);
        this.authClient = new auth.OAuth2User({
          client_id: currentAccount.credentials.client_id,
          client_secret: currentAccount.credentials.client_secret,
          callback: currentAccount.credentials.callback,
          scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
        });
        this.client = new Client(this.authClient);
      }
      const authUrl = this.authClient.generateAuthURL({
        code_challenge_method: "s256",
        state: this.STATE,
      });
      return res.redirect(authUrl);
    } catch (error) {
      throw new HttpException(
        `Internal Server error ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("/twitter_login")
  async twitter_login(@Res() res): Promise<any> {
    const authUrl = this.authClient.generateAuthURL({
      code_challenge_method: "s256",
      state: this.STATE,
    });
    return res.redirect(authUrl);
  }

  @Get("/callback")
  async twitterCallback(
    @Query("code") code: string,
    @Query("state") state: string
  ): Promise<string> {
    try {
      if (state !== this.STATE) throw new Error("State is not valid");
      const token = await this.authClient.requestAccessToken(code as string);
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
        ],
      });
      this.logger.log(my_user.data);
      await this.accountService.updateTwitterConfig({
        account: my_user.data.username,
        twitter: { ...my_user.data },
        ...(token.token as CreateAccountDto),
      });
      const updateAccount = {
        account: my_user.data.username,
        token: { ...token.token },
      };
      await this.accountService.updateToken(
        updateAccount as UpdateAccountTokenDto
      );
      return JSON.stringify(my_user);
    } catch (error) {
      this.logger.error(error);
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

  @Post("/login")
  async login(@Body() loginDto: LoginRequestDto): Promise<any> {
    if (
      loginDto.email === process.env.EMAIL &&
      loginDto.password === process.env.PASSWORD
    ) {
      return {
        api_token: `token ${loginDto.email} ${loginDto.password}`,
        refreshToken: "refresh_token",
      };
    } else {
      throw new UnauthorizedException("email or password is not valid");
    }
  }

  @Post("/verify_token")
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Forbidden." })
  @ApiBadRequestResponse({ description: "Invalid query." })
  @HttpCode(HttpStatus.CREATED)
  async verifyToken(@Body() verifyTokenDto: LoginVerifyTokenDto): Promise<any> {
    return {
      id: 1,
      username: "username",
      email: "email@email.com",
      firstname: "system",
    };
  }

  @Put("/")
  @ApiCreatedResponse({
    description: "Successfully created query and count values.",
    type: Number,
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Forbidden." })
  @ApiBadRequestResponse({ description: "Invalid query." })
  @HttpCode(HttpStatus.CREATED)
  async createAccount(
    @Body() createAccountDto: CreateAccountDto
  ): Promise<any> {
    this.logger.log(createAccountDto);
    try {
      return await this.accountService.create({
        ...createAccountDto,
        credentials: {
          client_id: createAccountDto.credentials.client_id,
          client_secret: createAccountDto.credentials.client_secret,
          callback: process.env.TWITTER_CLIENT_CALLBACK,
        },
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
