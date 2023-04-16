import { Test, TestingModule } from "@nestjs/testing";
import * as WPAPI from "wpapi";
import axios from "axios";
import { WordpressService } from "./wordpress.service";
import { ContentService } from "../content/content.service";
import { CONTENT_MODEL } from "../app.const";

jest.mock("wpapi");
jest.mock("axios");

describe("WordpressService", () => {
  let service: WordpressService;

  beforeEach(async () => {
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

    const result = await wordpressService.createPost(title, content, image);

    expect(mockCreate).toHaveBeenCalledWith({
      title,
      content,
      categories: [],
      tags: [],
      status: "private",
    });
    expect(result.id).toEqual(1);
    expect(result.title).toEqual(title);
  });

  // it("should upload media", async () => {

  //   const mockGet = jest.fn().mockResolvedValue({ data: Buffer.from("test") });
  //   jest.spyOn(axios, "get").mockImplementation(mockGet);

  //   const mockCreate = jest
  //     .fn()
  //     .mockResolvedValue({ id: 1, title: "Test Image" });
  //   const mockFile = jest.fn().mockReturnThis();
  //   const mockMedia = jest.fn().mockReturnValue({ file: mockFile });
  //   const wpapiMock = jest
  //     .fn()
  //     .mockReturnValue({ media: mockMedia, create: mockCreate });

  //   (WPAPI as jest.Mock).mockImplementation(wpapiMock);

  //   const image =
  //     "https://dragplus.com/wp-content/uploads/2023/04/Taylor-Swift-Arlington-eras-2023-billboard-1548.jpg";

  //   const result = await service.uploadMedia(image, "title");

  //   expect(result).toBe("ok");
  // });
});
