import { Test, TestingModule } from "@nestjs/testing";
import { ContentService } from "./content.service";
import { CONTENT_MODEL } from "../app.const";
import { Content } from "./interfaces/content.interface";
import { Model, Schema } from "mongoose";
import { CreateContentDto } from "./dto/create-content.dto";
import { Logger } from "@nestjs/common";
import { UpdateCrawlDto } from "./dto/update-crawl.dto";
import { UpdateGeneratedDto } from "./dto/update-generated.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";

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
  let mockContentModel;

  beforeEach(async () => {
    mockContentModel = {
      insertMany: jest.fn(),
    };

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
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            ...mockContentModel,
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

  it("getContentsByAccountNameForCrawl return value", async () => {
    jest.spyOn(model, "find").mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(contentArray),
    } as any);
    const contents = await service.getContentsByAccountNameForCrawl("account1");
    expect(contents).toEqual(contentArray);
  });

  describe("InsertMany", () => {
    it("should insert many content valid response", async () => {
      jest.spyOn(model, "insertMany").mockResolvedValueOnce(mockContent as any);
      const newContent = await service.createMany([
        {
          account: "account2",
          title: "title2",
          link: "http://example2.com",
          description: "desription2",
        } as CreateContentDto,
      ]);
      expect(newContent).toEqual(mockContent);
    });

    it("should throw an error when insertMany fails", async () => {
      const mockRssFeeds = [];
      const mockError = new Error("Insert many failed.");

      mockContentModel.insertMany.mockRejectedValue(mockError);

      await expect(service.createMany(mockRssFeeds)).rejects.toThrow(mockError);
    });

    it("should log a message when insertMany throws a duplicate content error", async () => {
      const mockRssFeeds = [];
      const mockError = { code: 11000 };

      mockContentModel.insertMany.mockRejectedValue(mockError);
      jest.spyOn(Logger, "log").mockImplementation();

      await service.createMany(mockRssFeeds);

      expect(Logger.log).toHaveBeenCalledTimes(1);
      expect(Logger.log).toHaveBeenCalledWith("duplicate content");
    });
  });

  it("getContentById return value", async () => {
    jest.spyOn(model, "findById").mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(mockContent),
    } as any);
    const mongooseObjectId = new Schema.Types.ObjectId("123456");
    const contents = await service.getContentById(mongooseObjectId);
    expect(contents).toEqual(mockContent);
  });

  it("should update crawl of content", async () => {
    jest
      .spyOn(model, "findByIdAndUpdate")
      .mockResolvedValueOnce(mockContent as any);
    const updated = await service.updateCrawl({
      id: "contentid",
      crawl: {
        url: "http://example.com",
        title: "this is a title",
        description: "description",
        image: "http://this.com/image.jpg",
        crawl_date: new Date(),
        keyword: "keyword, keyword",
        raw_text: "this ia row text",
      },
    } as UpdateCrawlDto);
    expect(updated).toEqual(mockContent);
  });

  it("should update blog publish of content", async () => {
    jest
      .spyOn(model, "findByIdAndUpdate")
      .mockResolvedValueOnce(mockContent as any);
    const updated = await service.updatePublish({
      id: "contentid",
      blog: {
        title: "this is a title",
        tags: "tags, tags",
        category: "category",
        body: "this a body",
        date: new Date(),
        id: 123456,
        link: "http://example.com",
        slug: "slug-test",
      },
    } as UpdateBlogDto);
    expect(updated).toEqual(mockContent);
  });

  it("should update generated content of content", async () => {
    jest
      .spyOn(model, "findByIdAndUpdate")
      .mockResolvedValueOnce(mockContent as any);
    const updated = await service.updateGenerated({
      id: "contentid",
      generated: {
        body: "this is a body",
        category: "category",
        tags: "tags, tags",
        title: "this is a title",
      },
    } as UpdateGeneratedDto);
    expect(updated).toEqual(mockContent);
  });
});
