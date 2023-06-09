import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Patch,
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
import { UpdateAccountTwitterDto } from "./dto/update-account-twitter.dto";
import { randomBytes } from "crypto";
import { UpdateAccountDto } from "./dto/update-account.dto";
import { TwitterService } from "../twitter/twitter.service";

@Controller("account")
export class AccountController {
  STATE = randomBytes(12).toString("hex");
  challenge = randomBytes(12).toString("hex");
  private readonly logger: Logger = new Logger(AccountController.name);
  constructor(
    private readonly accountService: AccountService,
    private readonly twitterService: TwitterService
  ) {}

  @Get("/")
  @ApiOperation({ summary: "Get list of the accounts" })
  async all(
    @Query("page") page: string,
    @Query("items_per_page") items_per_page: string
  ): Promise<Account[]> {
    try {
      const allAccounts = await this.accountService.getAllWithContents();
      return allAccounts;
    } catch (error) {
      throw new HttpException(
        `Internal Server error ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("/getByName/:account")
  @ApiOperation({ summary: "Get account by name" })
  async getByName(@Param("account") account: string): Promise<Account> {
    this.logger.debug(account);
    try {
      const accountDetails = await this.accountService.getAccountByName(
        account
      );
      return accountDetails;
    } catch (error) {
      throw new HttpException(
        "Internal Server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("/getById/:id")
  @ApiOperation({ summary: "Get account by id" })
  async getById(@Param("id") id: string): Promise<Account> {
    this.logger.debug(id);
    try {
      const accountDetails = await this.accountService.getAccountById(id);
      return accountDetails;
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
        const authClient = await this.getAuthClientInstance(account);

        const authUrl = authClient.generateAuthURL({
          state: this.STATE,
          code_challenge_method: "plain",
          code_challenge: this.challenge,
        });
        return res.redirect(authUrl);
      }

      throw new Error("No account has been specified ");
    } catch (error) {
      throw new HttpException(
        `Internal Server error ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("/callback")
  async twitterCallback(
    @Query("code") code: string,
    @Query("state") state: string,
    @Query("account") account: string
  ): Promise<string> {
    try {
      if (state !== this.STATE) throw new Error("State is not valid");
      const authClient = await this.getAuthClientInstance(account);
      authClient.generateAuthURL({
        state,
        code_challenge_method: "plain",
        code_challenge: this.challenge,
      });
      const { token } = await authClient.requestAccessToken(code);
      const client = await this.getClientInstance(authClient);
      const my_user = await client.users.findMyUser({
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
      this.logger.log(my_user.data);

      await this.accountService.updateTwitterConfig({
        account: my_user.data.username,
        twitter: { ...my_user.data },
      } as UpdateAccountTwitterDto);
      const updateAccount = {
        account: my_user.data.username,
        token: { ...token },
      };
      await this.accountService.updateToken(
        updateAccount as UpdateAccountTokenDto
      );
      return JSON.stringify(my_user);
    } catch (error) {
      this.logger.error(`twitterCallback ${JSON.stringify(error.message)}`);
    }
  }

  async getAuthClientInstance(account: string): Promise<auth.OAuth2User> {
    try {
      const currentAccount = await this.accountService.getAccountByName(
        account
      );
      const authClient = new auth.OAuth2User({
        client_id: currentAccount.credentials.client_id,
        client_secret: currentAccount.credentials.client_secret,
        callback: currentAccount.credentials.callback,
        scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
      });
      return authClient;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getClientInstance(authClient: auth.OAuth2User): Promise<Client> {
    return new Promise((resolve) => {
      const client = new Client(authClient);
      resolve(client);
    });
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
          callback: createAccountDto.credentials.callback,
        },
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Patch("/")
  @ApiCreatedResponse({
    description: "Successfully created query and count values.",
    type: Number,
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Forbidden." })
  @ApiBadRequestResponse({ description: "Invalid query." })
  @HttpCode(HttpStatus.CREATED)
  async updateAccount(
    @Body() updateAccountDto: UpdateAccountDto
  ): Promise<any> {
    this.logger.log(updateAccountDto);
    try {
      this.logger.debug(updateAccountDto.feeds);
      const feeds =
        updateAccountDto.feeds.length < 1
          ? updateAccountDto.feeds.split("\n")
          : updateAccountDto.feeds;
      const feedsTuple: [string] = feeds as [string];
      this.logger.debug(feedsTuple);
      await this.accountService.updateFeeds({
        account: updateAccountDto.account,
        feeds: feedsTuple,
      });
      await this.accountService.updateConfig({
        account: updateAccountDto.account,
        config: { reminder: updateAccountDto.config.reminder },
      });

      await this.accountService.updateCredentials({
        account: updateAccountDto.account,
        credentials: updateAccountDto.credentials,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Get("/refresh_account")
  @ApiCreatedResponse({
    description: "Successfully refreshed the account.",
    type: Number,
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Forbidden." })
  @ApiBadRequestResponse({ description: "Invalid query." })
  @HttpCode(HttpStatus.ACCEPTED)
  async refreshAccount(@Query("account") account: string): Promise<any> {
    this.logger.log(account);
    try {
      const my_user = await this.twitterService.refreshAccount(account);
      if (!my_user.data) {
        return new Error("couldn't get account detail");
      }
      await this.accountService.updateTwitterConfig({
        account: my_user.data.username,
        twitter: { ...my_user.data },
      } as UpdateAccountTwitterDto);
      return JSON.stringify(my_user);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
