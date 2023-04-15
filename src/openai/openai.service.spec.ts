import { Test, TestingModule } from "@nestjs/testing";
import { OpenAIService } from "./openai.service";

describe("OpenaiService", () => {
  let service: OpenAIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenAIService],
    }).compile();

    service = module.get<OpenAIService>(OpenAIService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should generate text", async () => {
    const text = await service.generateText("Hello world");
    expect(text).toBeTruthy();
    expect(typeof text).toBe("string");
  });
});
