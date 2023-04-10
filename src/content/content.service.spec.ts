import { Test, TestingModule } from "@nestjs/testing";
import { ContentService } from "./content.service";
import { CONTENT_MODEL } from "../app.const";
import { Content } from "./interfaces/content.interface";
import { Model } from "mongoose";

const mockContent = {
  account: "account1",
  title: "title",
  link: "http://example.com",
  description: "desription",
  published: new Date(),
};

describe("ContentService", () => {
  let service: ContentService;
  let model: Model<Content>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: CONTENT_MODEL,
          useValue: {
            new: jest.fn().mockResolvedValue(mockContent),
            constructor: jest.fn().mockResolvedValue(mockContent),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
    model = module.get<Model<Content>>(CONTENT_MODEL);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
