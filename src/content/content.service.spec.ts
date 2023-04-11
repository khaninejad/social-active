import { Test, TestingModule } from "@nestjs/testing";
import { ContentService } from "./content.service";
import { CONTENT_MODEL } from "../app.const";
import { Content } from "./interfaces/content.interface";
import { Model } from "mongoose";
import { CreateContentDto } from "./dto/create-content.dto";

const mockContent = {
  account: "account1",
  title: "title",
  link: "http://example.com",
  description: "desription",
  published: new Date(),
};

const contentArray = [
  {
    account: "account1",
    title: "title",
    link: "http://example.com",
    description: "desription",
    published: new Date(),
  },
  {
    account: "account2",
    title: "title2",
    link: "http://example2.com",
    description: "desription2",
    published: new Date(),
  },
];

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

  it("should return all contents", async () => {
    jest.spyOn(model, "find").mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(contentArray),
    } as any);
    const contents = await service.findAll();
    expect(contents).toEqual(contentArray);
  });

  it("should insert a new content", async () => {
    jest.spyOn(model, "create").mockResolvedValueOnce(mockContent as any);
    const newContent = await service.create({
      account: "account2",
      title: "title2",
      link: "http://example2.com",
      description: "desription2",
    } as CreateContentDto);
    expect(newContent).toEqual(mockContent);
  });
});
