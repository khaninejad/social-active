import { Test, TestingModule } from "@nestjs/testing";
import * as WPAPI from "wpapi";
import axios from "axios";
import { WordpressService } from "./wordpress.service";
import { ContentService } from "../content/content.service";
import { CONTENT_MODEL } from "../app.const";
import { Logger } from "@nestjs/common";

jest.mock("wpapi");
jest.mock("axios");

describe("WordpressService", () => {
  let service: WordpressService;

  beforeEach(async () => {
    process.env.WORDPRESS_ENDPOINT = "http://example.com";
    process.env.WORDPRESS_USERNAME = "user";
    process.env.WORDPRESS_PASSWORD = "password";
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordpressService,
        {
          provide: CONTENT_MODEL,
          useValue: {
            new: jest.fn(),
            constructor: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: CONTENT_MODEL,
          useValue: {
            new: jest.fn(),
            constructor: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
          },
        },
        ContentService,
        {
          provide: CONTENT_MODEL,
          useValue: {
            new: jest.fn(),
            constructor: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WordpressService>(WordpressService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("test title to slug", () => {
    expect(service["titleToSlug"]("this is a test")).toBe("this-is-a-test");
    expect(service["titleToSlug"]("this is $#@&^#!(*&est")).toBe("this-is-est");
    expect(service["titleToSlug"]("thi 1235 689 8est")).toBe(
      "thi-1235-689-8est"
    );
  });

  it("rename file with path valid request", () => {
    expect(service["renameFileWithPath"]("../test.jpg", "title of file")).toBe(
      "../title of file.jpg"
    );
    expect(service["renameFileWithPath"]("test.jpg", "new")).toBe("new.jpg");
    expect(() => service["renameFileWithPath"]("test", "new")).toThrowError(
      "File extension is invalid"
    );

    expect(() => service["renameFileWithPath"]("", "new")).toThrowError(
      "File path is invalid"
    );
  });

  describe("createPost", () => {
    it("should create a post", async () => {
      const mockCreate = jest
        .fn()
        .mockResolvedValue({ id: 1, title: "Test Post" });
      const wpapiMock = jest.fn().mockReturnValue({
        posts: jest.fn().mockReturnThis(),
        create: mockCreate,
      });

      (WPAPI as jest.Mock).mockImplementation(wpapiMock);

      const wordpressService = new WordpressService();

      const title = "Test Post";
      const content = "This is a test post.";
      const image = "http://image.com/image.jpg";

      const result = await wordpressService.createPost(
        title,
        content,
        image,
        ["category"],
        ["tags"]
      );

      expect(mockCreate).toHaveBeenCalledWith({
        title,
        content,
        featured_media: undefined,
        categories: undefined,
        tags: undefined,
        status: "publish",
      });
      expect(result.id).toEqual(1);
      expect(result.title).toEqual(title);
    });

    it("should throw error on create a post", async () => {
      jest
        .spyOn(service, "getTagIds")
        .mockRejectedValue(new Error("some error"));
      const loggerSpy = jest.spyOn(Logger, "error");

      const wordpressService = new WordpressService();

      const title = "Test Post";
      const content = "This is a test post.";
      const image = "http://image.com/image.jpg";

      await wordpressService.createPost(
        title,
        content,
        image,
        ["category"],
        ["tags"]
      );
      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  describe("uploadMedia", () => {
    it("should upload a media", async () => {
      jest.spyOn(axios, "get").mockResolvedValue({
        data: `okdata`,
      });
      const mockUpload = jest
        .fn()
        .mockResolvedValue({ id: 1, title: "Test Post" });
      const wpapiMock = jest.fn().mockReturnValue({
        file: jest.fn().mockReturnThis(),
        media: jest.fn().mockReturnThis(),
        create: mockUpload,
      });

      (WPAPI as jest.Mock).mockImplementation(wpapiMock);

      const wordpressService = new WordpressService();

      const title = "Test Post";
      const image = "http://image.com/image.jpg";

      const result = await wordpressService.uploadMedia(image, title);

      expect(mockUpload).toHaveBeenCalledWith({
        title,
      });
      expect(result.id).toEqual(1);
      expect(result.title).toEqual(title);
    });

    it("should throw error on upload a media", async () => {
      jest
        .spyOn(service, "getTagIds")
        .mockRejectedValue(new Error("some error"));
      const loggerSpy = jest.spyOn(Logger, "error");

      const wordpressService = new WordpressService();

      const title = "Test Post";
      const image = "http://image.com/image.jpg";

      await wordpressService.uploadMedia(image, title);
      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  describe("getCategoryIds", () => {
    it("should get the exists category", async () => {
      const mockGetCategory = jest
        .fn()
        .mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const wpapiMock = jest.fn().mockReturnValue({
        categories: jest.fn().mockReturnThis(),
        slug: jest.fn().mockReturnThis(),
        get: mockGetCategory,
      });

      (WPAPI as jest.Mock).mockImplementation(wpapiMock);

      const wordpressService = new WordpressService();

      const category = "Test Post";

      const result = await wordpressService.getCategoryIds([category]);

      expect(mockGetCategory).toHaveBeenCalled();
      expect(result).toEqual([1]);
    });

    it("should get non-exists category", async () => {
      const mockGetCategory = jest.fn().mockResolvedValue([]);
      const wpapiMock = jest.fn().mockReturnValue({
        categories: jest.fn().mockReturnThis(),
        slug: jest.fn().mockReturnThis(),
        get: mockGetCategory,
        create: jest.fn().mockResolvedValue({ id: 23 }),
      });

      (WPAPI as jest.Mock).mockImplementation(wpapiMock);

      const wordpressService = new WordpressService();

      const category = "Test Post";

      const result = await wordpressService.getCategoryIds([category]);

      expect(mockGetCategory).toHaveBeenCalled();
      expect(result).toEqual([23]);
    });

    it("should throw error on category get", async () => {
      const mockCategory = jest.fn().mockRejectedValue(new Error("some error"));
      const wpapiMock = jest.fn().mockReturnValue({
        categories: jest.fn().mockReturnThis(),
        create: mockCategory,
      });

      (WPAPI as jest.Mock).mockImplementation(wpapiMock);
      const loggerSpy = jest.spyOn(Logger, "error");

      const wordpressService = new WordpressService();

      await wordpressService.getCategoryIds(["test"]);
      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  describe("getTagIds", () => {
    it("should get the exists tag", async () => {
      const mockGetTag = jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const wpapiMock = jest.fn().mockReturnValue({
        tags: jest.fn().mockReturnThis(),
        slug: mockGetTag,
        get: mockGetTag,
      });

      (WPAPI as jest.Mock).mockImplementation(wpapiMock);

      const wordpressService = new WordpressService();

      const tag = "tag Post";

      const result = await wordpressService.getTagIds([tag]);

      expect(mockGetTag).toHaveBeenCalled();
      expect(result).toEqual([1]);
    });

    it("should get non-exists category", async () => {
      const mockGetCategory = jest.fn().mockResolvedValue([]);
      const wpapiMock = jest.fn().mockReturnValue({
        categories: jest.fn().mockReturnThis(),
        slug: jest.fn().mockReturnThis(),
        get: mockGetCategory,
        create: jest.fn().mockResolvedValue({ id: 23 }),
      });

      (WPAPI as jest.Mock).mockImplementation(wpapiMock);

      const wordpressService = new WordpressService();

      const category = "Test Post";

      const result = await wordpressService.getCategoryIds([category]);

      expect(mockGetCategory).toHaveBeenCalled();
      expect(result).toEqual([23]);
    });

    it("should throw error on category get", async () => {
      const mockCategory = jest.fn().mockRejectedValue(new Error("some error"));
      const wpapiMock = jest.fn().mockReturnValue({
        categories: jest.fn().mockReturnThis(),
        create: mockCategory,
      });

      (WPAPI as jest.Mock).mockImplementation(wpapiMock);
      const loggerSpy = jest.spyOn(Logger, "error");

      const wordpressService = new WordpressService();

      await wordpressService.getCategoryIds(["test"]);
      expect(loggerSpy).toHaveBeenCalled();
    });
  });
});
