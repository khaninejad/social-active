import { Test, TestingModule } from "@nestjs/testing";
import { TwitterService } from "./twitter.service";
import { AccountService } from "../account/account.service";
import { ACCOUNT_MODEL } from "../app.const";
import { Account } from "src/account/interfaces/account.interface";
import Client, { auth } from "twitter-api-sdk";
jest.mock("twitter-api-sdk");

const mockAccount = {
  credentials: {
    TWITTER_CLIENT_ID: "TWITTER_CLIENT_ID",
    TWITTER_CLIENT_SECRET: "TWITTER_CLIENT_SECRET",
    callback: "callback",
  },
  access_token: "access_token",
  refresh_token: "refresh_token",
} as Account;

describe("TwitterService", () => {
  let service: TwitterService;
  let accountService: AccountService;
  let loggerSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwitterService,
        AccountService,
        {
          provide: ACCOUNT_MODEL,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TwitterService>(TwitterService);
    accountService = module.get<AccountService>(AccountService);
    loggerSpy = jest.spyOn(service["logger"], "log");
    loggerErrorSpy = jest.spyOn(service["logger"], "error");
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
  describe("tweet", () => {
    it("should create a new tweet", async () => {
      const accountName = "test-account";
      const tweetText = "Hello Twitter!";
      jest.spyOn(accountService, "getAccount").mockResolvedValue(mockAccount);

      const tweetResponse = { title: "Test Post" };
      const createTweetMock = jest.fn().mockResolvedValue(tweetResponse);

      const tweetsMock = jest.fn().mockReturnValue({
        createTweet: createTweetMock,
      });

      const clientMock = jest.fn().mockReturnValue({
        tweets: tweetsMock(),
      });

      (auth.OAuth2User as jest.Mock).mockReturnValue({
        access_token: mockAccount.access_token,
        refresh_token: mockAccount.refresh_token,
        isAccessTokenExpired: jest.fn().mockReturnValue(false),
      });

      (Client as jest.Mock).mockImplementation(clientMock);

      const result = await service.tweet(accountName, tweetText);

      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
    });

    it("should log an error if tweet creation fails", async () => {
      const accountName = "test-account";
      const tweetText = "Hello Twitter!";
      jest
        .spyOn(accountService, "getAccount")
        .mockRejectedValue(new Error("some error"));

      await service.tweet(accountName, tweetText);

      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith("getAuthClient {}");
    });

    it("should log an error if tweet creation fails", async () => {
      const accountName = "test-account";
      const tweetText = "Hello Twitter!";
      jest.spyOn(service as any, "getAuthClient").mockImplementation(() => {
        throw new Error("Error getting auth client");
      });

      await service.tweet(accountName, tweetText);

      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith("tweet {}");
    });
  });

  describe("getAuthClient", () => {
    it("should log an error if get account fails", async () => {
      const accountName = "test-account";
      const token = "token";

      jest.spyOn(accountService, "getAccount").mockResolvedValue(mockAccount);

      (auth.OAuth2User as jest.Mock).mockReturnValue({
        access_token: mockAccount.access_token,
        refresh_token: mockAccount.refresh_token,
        isAccessTokenExpired: jest.fn().mockReturnValue(true),
        refreshAccessToken: jest.fn().mockResolvedValue({ token: "token" }),
        token,
      });

      const clientMock = jest.fn().mockReturnValue({
        tweets: jest.fn(),
      });

      (Client as jest.Mock).mockImplementation(clientMock);
      jest.spyOn(accountService, "updateToken").mockImplementation();

      const authClient = await service["getAuthClient"](accountName);

      expect(loggerErrorSpy).toHaveBeenCalledWith("access token is expired");
      expect(authClient.token).toBe(token);
    });
  });
});
