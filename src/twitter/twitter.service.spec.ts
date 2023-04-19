import { Test, TestingModule } from "@nestjs/testing";
import { TwitterService } from "./twitter.service";
import { AccountService } from "../account/account.service";
import { ACCOUNT_MODEL } from "../app.const";

describe("TwitterService", () => {
  let service: TwitterService;

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
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
