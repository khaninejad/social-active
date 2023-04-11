import { Test, TestingModule } from "@nestjs/testing";
import { TaskService } from "./task.service";
import { SchedulerRegistry } from "@nestjs/schedule";
import { AccountService } from "../account/account.service";
import { ContentService } from "../content/content.service";
import { RssService } from "../rss/rss.service";

const mockAccount = {
  account: "account1",
  access_token: "random_token",
  refresh_token: "random_refresh_account",
  expires_at: 1681219898317,
  feeds: [],
  config: {},
};

describe("TaskService", () => {
  let service: TaskService;
  let accountService: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskService,
          useValue: {
            constructor: jest.fn(),
          },
        },
        SchedulerRegistry,
        {
          provide: AccountService,
          useValue: {
            getAll: jest.fn(),
          },
        },
        {
          provide: ContentService,
          useValue: {
            createMany: jest.fn(),
          },
        },
        {
          provide: RssService,
          useValue: {
            fetch: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    accountService = module.get<AccountService>(AccountService);
  });

  it("should be defined", () => {
    jest
      .spyOn(accountService, "getAll")
      .mockResolvedValue([mockAccount] as any);
    expect(service).toBeDefined();
  });
});
