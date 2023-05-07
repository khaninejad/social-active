import { Test, TestingModule } from "@nestjs/testing";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { Account } from "./interfaces/account.interface";
jest.mock("../app.const");

describe("AccountController", () => {
  let controller: AccountController;
  let service: AccountService;

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
            getAccount: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get<AccountService>(AccountService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("login", () => {
    it("should redirect to the auth URL", async () => {
      const authUrl = "http://example.com/auth";
      jest
        .spyOn(controller["authClient"], "generateAuthURL")
        .mockReturnValue(authUrl);

      const res = {
        redirect: jest.fn(),
      };
      await controller.twitter_login(res);

      expect(res.redirect).toHaveBeenCalledWith(authUrl);
    });
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

    it("should create an account with the user data and token", async () => {
      jest
        .spyOn(controller["authClient"], "requestAccessToken")
        .mockResolvedValue({ token: token });
      jest
        .spyOn(controller["client"].users, "findMyUser")
        .mockResolvedValue(my_user);
      jest.spyOn(service, "create").mockImplementation();

      const result = await controller.twitterCallback(code, state);

      expect(result).toBe(JSON.stringify(my_user));
      expect(controller["authClient"].requestAccessToken).toHaveBeenCalledWith(
        code
      );
      expect(controller["client"].users.findMyUser).toHaveBeenCalled();
      expect(service.create).toHaveBeenCalledWith({
        account: my_user.data.username,
        ...token,
      });
    });

    it("should throw an error if the state is not valid", async () => {
      const invalidState = "invalid-state";

      await expect(
        controller.twitterCallback(code, invalidState)
      ).rejects.toThrow("State is not valid");
    });
  });

  describe("Feeds", () => {
    it("should update feed", async () => {
      const account = {
        account: "account1",
        access_token: "random_token",
        refresh_token: "random_refresh_account",
        expires_at: "1681219898317",
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
        access_token: "random_token",
        refresh_token: "random_refresh_account",
        expires_at: "1681219898317",
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
        access_token: "random_token",
        refresh_token: "random_refresh_account",
        expires_at: "1681219898317",
        feeds: [],
        config: {},
        credentials: {
          TWITTER_CLIENT_ID: "client-id",
          TWITTER_CLIENT_SECRET: "client-secret",
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
      const account = {
        account: "account1",
        access_token: "random_token",
        refresh_token: "random_refresh_account",
        expires_at: "1681219898317",
        feeds: [],
        config: {},
        credentials: {
          TWITTER_CLIENT_ID: "client-id",
          TWITTER_CLIENT_SECRET: "client-secret",
          callback: "http://example.com/callnback",
        },
      };

      const url = "http://example.com/callback";
      jest.spyOn(service, "getAccount").mockResolvedValue(account as Account);

      jest.spyOn(service, "getLoginUrl").mockReturnValue(url);
      const res = await controller.account("account");

      expect(res).toBe(url);
    });
  });
});
