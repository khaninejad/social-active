import { Test, TestingModule } from "@nestjs/testing";
import { AccountService } from "./account.service";
import { Account } from "./interfaces/account.interface";
import { Model } from "mongoose";
import { CreateAccountDto } from "./dto/create-account.dto";
import { ACCOUNT_MODEL } from "../app.const";
import { UpdateAccountFeedDto } from "./dto/update-account-feed.dto";
import { UpdateAccountConfigDto } from "./dto/update-account-config.dto";
import { UpdateAccountCredentialsDto } from "./dto/update-account-credentials.dto";

const mockAccount: CreateAccountDto = {
  account: "account1",
  access_token: "random_token",
  refresh_token: "random_refresh_account",
  expires_at: 1681219898317,
  scope: "write",
  token_type: "bearer",
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
      access_token: "random_token",
      refresh_token: "random_refresh_account",
      expires_at: 1681219898317,
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
        client_id: "client-id",
        client_secret: "client-secret",
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
});
