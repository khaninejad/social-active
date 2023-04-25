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
  let loggerSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    schedulerRegistry = new SchedulerRegistry();

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

    loggerSpy = jest.spyOn(taskService["logger"], "log");
    loggerWarnSpy = jest.spyOn(taskService["logger"], "warn");
  });

  afterEach(() => {
    taskService.deleteAllJobs();
    loggerSpy.mockClear();
  });

  describe("fetchFeeds", () => {
    it("should call addCronJob with correct parameters", async () => {
      expect(schedulerRegistry.getCronJobs().size).toBe(1);
      expect(loggerSpy).toHaveBeenCalledWith("tasks started");
    });
    it("should call dispatchJob when a cron job is executed", async () => {
      jest.setTimeout(10000);

      const dispatchJobSpy = jest.spyOn(taskService as any, "dispatchJob");

      const name = "test";
      const time = "30m";
      const feeds = ["http://example.com/feed"];
      jest.useFakeTimers();

      const job = taskService.addCronJob(name, time, feeds);

      jest.advanceTimersByTime(30 * 60 * 1000);

      expect(dispatchJobSpy).toHaveBeenCalledWith(time, name, feeds);
      expect(dispatchJobSpy).toHaveBeenCalledTimes(1);

      job.stop();
      taskService.deleteCron(name);
    });
  });

  describe("addCronJob", () => {
    it("should add a cron job to the scheduler", async () => {
      jest.spyOn(rssService, "fetch").mockImplementation();
      jest.spyOn(contentService, "createMany").mockImplementation();
      jest.spyOn(eventEmitter, "emit").mockImplementation();
      const job = taskService.addCronJob("test-new", "1m", [
        "http://test-feed.com/rss",
      ]);
      job.stop();
      expect(schedulerRegistry.getCronJob("test-new").nextDate()).toBeTruthy();
      expect(schedulerRegistry.getCronJob("test-new").lastDate()).toBe(
        undefined
      );
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        `job test-new added for each time at 1m!`
      );
    });
  });

  describe("deleteCron", () => {
    it("should call schedulerRegistry.deleteCronJob with correct parameters", () => {
      taskService.addCronJob("test-job", "1m", []);
      taskService.deleteCron("test-job");

      expect(schedulerRegistry.getCronJobs().size).toBe(1);
    });
  });

  describe("getCronString", () => {
    it("should throw an error for invalid time variant", () => {
      expect(() => {
        const expression = "5s";
        taskService["getCronString"](expression);
      }).toThrowError("invalid time variant");
    });

    it('should return the correct cron string for the "h" time variant', () => {
      expect(taskService["getCronString"]("h5")).toEqual("* * */5 9-20 * *");
    });
  });

  describe("dispatchJob", () => {
    it("should check for a valid job execution", async () => {
      await taskService["dispatchJob"]("* * */5 9-20 * *", "name", []);
      expect(rssService.fetch).toHaveBeenCalledTimes(1);
      expect(contentService.createMany).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(loggerWarnSpy).toHaveBeenCalledTimes(2);
    });
  });
});
