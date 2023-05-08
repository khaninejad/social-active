import { Test, TestingModule } from "@nestjs/testing";
import { AccountService } from "./account.service";
import { Account } from "./interfaces/account.interface";
import { Model } from "mongoose";
import { CreateAccountDto } from "./dto/create-account.dto";
import { ACCOUNT_MODEL } from "../app.const";
import { UpdateAccountFeedDto } from "./dto/update-account-feed.dto";
import { UpdateAccountConfigDto } from "./dto/update-account-config.dto";
import { UpdateAccountCredentialsDto } from "./dto/update-account-credentials.dto";
import { UpdateAccountTokenDto } from "./dto/update-account-token.dto";
import { UpdateAccountTwitterDto } from "./dto/update-account-twitter.dto";

const mockAccount: CreateAccountDto = {
  account: "account1",
  config: {
    reminder: "2h",
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
  feeds: "http://example.com\nhttp://example2.com",
};

describe("AccountService", () => {
  let service: AccountService;
  let model: Model<Account>;
  let mockAccountModel;

  beforeEach(async () => {
    mockAccountModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: ACCOUNT_MODEL,
          useValue: {
            new: jest.fn().mockResolvedValue(mockAccount),
            constructor: jest.fn().mockResolvedValue(mockAccount),
            findOneAndUpdate: jest.fn(),
            save: jest.fn(),
            ...mockAccountModel,
          },
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    model = module.get<Model<Account>>(ACCOUNT_MODEL);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should insert a new account", async () => {
    jest
      .spyOn(model, "findOneAndUpdate")
      .mockResolvedValueOnce(mockAccount as any);
    const newContent = await service.create({
      account: "account1",
      feeds: "http://example.com\nhttp://example2.com",
    } as CreateAccountDto);
    expect(newContent).toEqual(mockAccount);
  });

  it("should update feeds of account", async () => {
    jest
      .spyOn(model, "findOneAndUpdate")
      .mockResolvedValueOnce(mockAccount as any);
    const updated = await service.updateFeeds({
      account: "account1",
      feeds: ["http://google.com"],
    } as UpdateAccountFeedDto);
    expect(updated).toEqual(mockAccount);
  });

  it("should update config of account", async () => {
    jest
      .spyOn(model, "findOneAndUpdate")
      .mockResolvedValueOnce(mockAccount as any);
    const updated = await service.updateConfig({
      account: "account1",
      config: { reminder: "2h" },
    } as UpdateAccountConfigDto);
    expect(updated).toEqual(mockAccount);
  });

  it("should update credentials of account", async () => {
    jest
      .spyOn(model, "findOneAndUpdate")
      .mockResolvedValueOnce(mockAccount as any);
    const updated = await service.updateCredentials({
      account: "account1",
      credentials: {
        TWITTER_CLIENT_ID: "client-id",
        TWITTER_CLIENT_SECRET: "client-secret",
        callback: "callback",
      },
    } as UpdateAccountCredentialsDto);
    expect(updated).toEqual(mockAccount);
  });

  it("should get all account", async () => {
    mockAccountModel.exec.mockResolvedValue([mockAccount]);
    const updated = await service.getAll();
    expect(mockAccountModel.find).toHaveBeenCalledTimes(1);
    expect(mockAccountModel.exec).toHaveBeenCalledTimes(1);
    expect(updated[0]).toEqual(mockAccount);
  });

  it("should get an account", async () => {
    mockAccountModel.exec.mockResolvedValue(mockAccount);
    const updated = await service.getAccount("account-name");
    expect(mockAccountModel.findOne).toHaveBeenCalledTimes(1);
    expect(mockAccountModel.exec).toHaveBeenCalledTimes(1);
    expect(updated).toEqual(mockAccount);
  });

  it("get login url", () => {
    const updated = service.getLoginUrl();
    expect(updated).toEqual(
      'Follow the link for <a href="undefined">login</a>'
    );
  });

  it("should update token of account", async () => {
    jest
      .spyOn(model, "findOneAndUpdate")
      .mockResolvedValueOnce(mockAccount as any);
    const updated = await service.updateToken({
      account: "account1",
      token: {
        access_token: "test",
        expires_at: 123456,
        refresh_token: "refresh_token",
        scope: "offline",
        token_type: "bearer",
      },
    } as UpdateAccountTokenDto);
    expect(updated).toEqual(mockAccount);
  });

  it("should update twitter config of account", async () => {
    jest
      .spyOn(model, "findOneAndUpdate")
      .mockResolvedValueOnce(mockAccount as any);
    const updated = await service.updateTwitterConfig({
      account: "account1",
      twitter: {
        id: "1",
        name: "name",
        url: "http://url.com",
        description: "description",
        profile_image_url: "http://image.com",
        username: "username",
        created_at: "2020-10-10",
        location: "Berlin, Germany",
        verified: "true",
      },
    } as UpdateAccountTwitterDto);
    expect(updated).toEqual(mockAccount);
  });
});
