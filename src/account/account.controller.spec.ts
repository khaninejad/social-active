import { Test, TestingModule } from "@nestjs/testing";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { Account } from "./interfaces/account.interface";
import { CreateAccountDto } from "./dto/create-account.dto";
import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { Client, auth } from "twitter-api-sdk";
jest.mock("../app.const");

const account: CreateAccountDto = {
  account: "test",
  config: {
    reminder: "",
  },
  credentials: {
    client_id: "",
    client_secret: "",
    callback: "",
  },
  twitter: {
    id: "",
    username: "",
    name: "",
    url: "",
    description: "",
    profile_image_url: "",
    location: "",
    verified: "",
    created_at: "",
  },
  feeds: "",
};

const getAccountMock = {
  account: "account1",
  token: {
    access_token: "random_token",
    refresh_token: "random_refresh_account",
    expires_at: "1681219898317",
  },
  feeds: [],
  config: {},
  credentials: {
    client_id: "client-id",
    client_secret: "client-secret",
    callback: "http://example.com/callback",
  },
};

describe("AccountController", () => {
  let controller: AccountController;
  let service: AccountService;
  let errorLogger: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: {
            getLoginUrl: jest.fn(),
            create: jest.fn(),
            updateFeeds: jest.fn(),
            updateConfig: jest.fn(),
            updateCredentials: jest.fn(),
            updateTwitterConfig: jest.fn(),
            updateToken: jest.fn(),
            getAccount: jest.fn(),
            getAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get<AccountService>(AccountService);
    errorLogger = jest.spyOn(controller["logger"], "error");
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("callback", () => {
    const code = "12345";
    const state = "my-state";
    const token = {
      token_type: "Bearer",
      access_token: "access_token",
      refresh_token: "refresh_token",
      expires_in: 3600,
      twitter: {
        id: "123",
        name: "John Doe",
        username: "johndoe",
      },
    };
    const my_user = {
      data: {
        id: "123",
        name: "John Doe",
        username: "johndoe",
      },
    };

    it("should update the account token with the user data and twitter info", async () => {
      const authClient = {
        requestAccessToken: jest.fn().mockReturnValue({ token: token }),
        isAccessTokenExpired: false,
        getAuthHeader: jest.fn(),
      } as unknown as Promise<auth.OAuth2User>;
      jest
        .spyOn(controller, "getAuthClientInstance")
        .mockImplementation(() => authClient);
      const mockClientInstance = {
        users: {
          findMyUser: jest.fn().mockReturnValue({
            ...my_user,
          }),
        },
      } as unknown as Client;
      const getClientInstanceSpy = jest
        .spyOn(controller, "getClientInstance")
        .mockResolvedValue(mockClientInstance);

      jest.spyOn(service, "create").mockImplementation();

      const result = await controller.twitterCallback(
        code,
        state,
        "valid-account"
      );

      expect(result).toBe(JSON.stringify(my_user));
      expect(getClientInstanceSpy).toHaveBeenCalledWith(
        "valid-account",
        code,
        authClient
      );
      expect(mockClientInstance.users.findMyUser).toHaveBeenCalled();
      expect(service.updateToken).toHaveBeenCalledWith({
        account: my_user.data.username,
        token: { ...token },
      });
      expect(service.updateTwitterConfig).toHaveBeenCalledWith({
        account: my_user.data.username,
        twitter: { ...my_user.data },
      });
    });

    it("should throw an error if the state is not valid", async () => {
      const invalidState = "invalid-state";

      await expect(
        controller.twitterCallback(code, invalidState, "invalid-account")
      ).rejects.toThrow("State is not valid");
    });
  });

  describe("Feeds", () => {
    it("should update feed", async () => {
      const account = {
        account: "account1",
        feeds: ["http://google.com"],
      };
      jest.spyOn(service, "updateFeeds").mockResolvedValue(account as Account);

      const req = {
        account: "account1",
        feeds: ["https://google.com"],
      };
      const res = await controller.feeds(req);

      expect(res).toBe(account);
    });
  });

  describe("Config", () => {
    it("should update feed", async () => {
      const account = {
        account: "account1",
        feeds: [],
        config: { reminder: "2h" },
      };
      jest.spyOn(service, "updateConfig").mockResolvedValue(account as Account);

      const req = {
        account: "account1",
        config: { reminder: "2h" },
      };
      const res = await controller.config(req);

      expect(res).toBe(account);
    });
  });

  describe("credentials", () => {
    it("should update credentials", async () => {
      const account = {
        account: "account1",
        token: {},
        feeds: [],
        config: {},
        credentials: {
          client_id: "client-id",
          client_secret: "client-secret",
          callback: "http://example.com/callnback",
        },
      };
      jest
        .spyOn(service, "updateCredentials")
        .mockResolvedValue(account as Account);

      const req = {
        account: "account1",
        credentials: {
          TWITTER_CLIENT_ID: "client-id",
          TWITTER_CLIENT_SECRET: "client-secret",
          callback: "http://example.com/callnback",
        },
      };
      const res = await controller.credentials(req);

      expect(res).toBe(account);
    });
  });

  describe("index", () => {
    it("get twitter account", async () => {
      const url = "http://example.com/callback";
      jest
        .spyOn(service, "getAccount")
        .mockResolvedValue(getAccountMock as Account);

      const responseMock = {
        send: jest.fn((x) => x),
        redirect: jest.fn().mockReturnValue(url),
      } as unknown as Response;

      jest.spyOn(service, "getLoginUrl").mockReturnValue(url);
      const res = await controller.account("account", responseMock);

      expect(res).toBe(url);
    });

    it("should throw an HttpException with an error message when an error occurs", async () => {
      const mockError = new Error("Mock error message");
      jest
        .spyOn(controller, "getAuthClientInstance")
        .mockRejectedValue(mockError);

      const account = "mockAccount";
      const res = {
        redirect: jest.fn(),
      };

      await expect(controller.account(account, res)).rejects.toThrow(
        new HttpException(
          `Internal Server error ${mockError}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe("createAccount", () => {
    it("should create an account", async () => {
      jest
        .spyOn(service, "create")
        .mockResolvedValue({ ...account, _id: "id" } as unknown as Account);

      const res = await controller.createAccount(account);

      expect(res._id).toBe("id");
    });

    it("should create an account", async () => {
      jest
        .spyOn(service, "create")
        .mockRejectedValue(new Error("create failed"));

      await controller.createAccount(account);

      expect(errorLogger).toHaveBeenCalledWith(new Error("create failed"));
    });
  });

  describe("verifyToken method", () => {
    it("should return a user object with valid token", async () => {
      const verifyTokenDto = { token: "valid_token" };
      const result = await controller.verifyToken(verifyTokenDto);
      expect(result).toEqual({
        id: 1,
        username: "username",
        email: "email@email.com",
        firstname: "system",
      });
    });
  });

  describe("all method", () => {
    it("should return an array of accounts", async () => {
      const allAccounts: Account[] = [
        {
          ...account,
          id: 1,
          account: "account1",
        } as unknown as Account,
        {
          ...account,
          id: 2,
          account: "account2",
        } as unknown as Account,
      ];
      jest.spyOn(service, "getAll").mockResolvedValue(allAccounts);
      const result = await controller.all("1", "10");
      expect(service.getAll).toHaveBeenCalledWith();
      expect(result).toEqual(allAccounts);
    });

    it("should throw an error if accountService.getAll() throws an error", async () => {
      jest
        .spyOn(service, "getAll")
        .mockRejectedValue(new Error("getAll failed"));
      await expect(controller.all("1", "10")).rejects.toThrow(
        new HttpException(
          "Internal Server error",
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe("login method", () => {
    it("should return an access token and refresh token when given valid email and password", async () => {
      const loginDto = {
        email: process.env.EMAIL,
        password: process.env.PASSWORD,
      };
      const expectedResult = {
        api_token: `token ${loginDto.email} ${loginDto.password}`,
        refreshToken: "refresh_token",
      };

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
    });

    it("should throw an UnauthorizedException when given invalid email and password", async () => {
      const loginDto = { email: "invalid_email", password: "invalid_password" };

      await expect(controller.login(loginDto)).rejects.toThrow(
        new UnauthorizedException("email or password is not valid")
      );
    });
  });
});
