import { SchedulerRegistry } from "@nestjs/schedule";
import { AccountService } from "../account/account.service";
import { RssService } from "../rss/rss.service";
import { ContentService } from "../content/content.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { TaskService } from "./task.service";

describe("TaskService", () => {
  let taskService: TaskService;
  let schedulerRegistry: SchedulerRegistry;
  let accountService: AccountService;
  let rssService: RssService;
  let contentService: ContentService;
  let eventEmitter: EventEmitter2;

  beforeEach(() => {
    schedulerRegistry = {
      addCronJob: jest.fn(),
      deleteCronJob: jest.fn(),
    } as unknown as SchedulerRegistry;

    accountService = {
      getAll: jest.fn().mockResolvedValue([
        {
          account: "test-account",
          config: {
            reminder: "1m",
          },
          feeds: ["http://test-feed.com/rss"],
        },
      ]),
    } as unknown as AccountService;

    rssService = {
      fetch: jest.fn().mockResolvedValue([
        {
          title: "Test Title",
          description: "Test Description",
          link: "http://test-link.com",
          published: "2023-04-23T00:00:00.000Z",
        },
      ]),
    } as unknown as RssService;

    contentService = {
      createMany: jest.fn(),
    } as unknown as ContentService;

    eventEmitter = {
      emit: jest.fn(),
    } as unknown as EventEmitter2;

    taskService = new TaskService(
      schedulerRegistry,
      accountService,
      rssService,
      contentService,
      eventEmitter
    );
  });

  describe("fetchFeeds", () => {
    it("should call addCronJob with correct parameters", async () => {
      await taskService.fetchFeeds();

      expect(schedulerRegistry.addCronJob).toBeCalledTimes(2);
    });
  });

  describe("addCronJob", () => {
    it("should add a cron job to the scheduler", async () => {
      taskService.addCronJob("test-job", "1m", ["http://test-feed.com/rss"]);
      expect(schedulerRegistry.addCronJob).toHaveBeenCalledWith(
        "test-job",
        expect.anything()
      );
    });
  });

  describe("deleteCron", () => {
    it("should call schedulerRegistry.deleteCronJob with correct parameters", () => {
      taskService.deleteCron("test-job");

      expect(schedulerRegistry.deleteCronJob).toHaveBeenCalledWith("test-job");
    });
  });
});
