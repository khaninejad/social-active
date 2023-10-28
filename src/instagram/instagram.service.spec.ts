import { Test, TestingModule } from "@nestjs/testing";
import { InstagramService } from "./instagram.service";
import { INSTAGRAM_MODEL } from "../app.const";

describe("InstagramService", () => {
  let service: InstagramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstagramService,
        {
          provide: INSTAGRAM_MODEL,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<InstagramService>(InstagramService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
