import { Test, TestingModule } from "@nestjs/testing";
import { AccountService } from "./account.service";
import { Account } from "./interfaces/account.interface";
import { Model } from "mongoose";
import { CreateAccountDto } from "./dto/create-account.dto";
import { ACCOUNT_MODEL } from "../app.const";

const mockAccount: CreateAccountDto = {
  account: "account1",
  access_token: "random_token",
  refresh_token: "random_refresh_account",
  expires_at: 1681219898317,
};

describe("AccountService", () => {
  let service: AccountService;
  let model: Model<Account>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: ACCOUNT_MODEL,
          useValue: {
            new: jest.fn().mockResolvedValue(mockAccount),
            constructor: jest.fn().mockResolvedValue(mockAccount),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
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
    jest.spyOn(model, "create").mockResolvedValueOnce(mockAccount as any);
    const newContent = await service.create({
      account: "account1",
      access_token: "random_token",
      refresh_token: "random_refresh_account",
      expires_at: 1681219898317,
    } as CreateAccountDto);
    expect(newContent).toEqual(mockAccount);
  });
});
