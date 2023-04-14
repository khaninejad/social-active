import { Test, TestingModule } from "@nestjs/testing";
import * as WPAPI from "wpapi";
import { WordpressService } from "./wordpress.service";
import { ContentService } from "../content/content.service";
import { CONTENT_MODEL } from "../app.const";

jest.mock("wpapi");

describe("WordpressService", () => {
  let service: WordpressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordpressService,
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
      status: "private",
    });
    expect(result.id).toEqual(1);
    expect(result.title).toEqual(title);
  });

  it("should upload media", async () => {
    const wordpressService = new WordpressService();

    const image =
      "https://dragplus.com/wp-content/uploads/2023/04/Taylor-Swift-Arlington-eras-2023-billboard-1548.jpg";

    const result = await wordpressService.uploadMedia(image);

    expect(result).toBe("ok");
  });
});
