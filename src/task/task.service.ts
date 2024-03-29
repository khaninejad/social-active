import { Injectable, Logger } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { AccountService } from "../account/account.service";
import { RssService } from "../rss/rss.service";
import { ContentService } from "../content/content.service";
import { CreateContentDto } from "../content/dto/create-content.dto";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ContentUpdatedEvent } from "../events/content-updated.event";

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly accountService: AccountService,
    private readonly rssService: RssService,
    private readonly contentService: ContentService,
    private eventEmitter: EventEmitter2
  ) {
    this.fetchFeeds().then(() => this.logger.log("tasks started"));
    this.deleteOldContent();
  }
  async fetchFeeds() {
    const accounts = await this.accountService.getAll();
    accounts.forEach((item) => {
      if (item.config.reminder !== "disabled") {
        this.addCronJob(item.account, item.config.reminder, item.feeds);
      }
    });
  }

  async deleteOldContent() {
    const contents = await this.contentService.deleteOldContent(30);
    console.log(`contents removed ${contents}`);
  }
  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  generateRandomDateTime(): Date {
    const now = new Date();
    const randomSeconds = this.getRandomInt(1, 120);

    // Calculate the next time
    const nextTime = new Date(now.getTime() + randomSeconds * 1000); // Convert seconds to milliseconds

    return nextTime;
  }

  addCronJob(name: string, time: string, feeds: string[]): CronJob {
    this.logger.warn(`starting ${name}`);

    const job = new CronJob(this.getCronString(time), async () => {
      await this.dispatchJob(time, name, feeds);
    });
    this.schedulerRegistry.addCronJob(name, job);
    job.start();

    this.logger.warn(`job ${name} added for each time at ${time}!`);
    return job;
  }

  private async dispatchJob(time: string, name: string, feeds: string[]) {
    this.logger.warn(`time (${time}) for job ${name} to run!`);
    const rssData = await this.rssService.fetch(feeds);
    const mapped = rssData?.map((data) => {
      return {
        account: name,
        id: undefined,
        description: data.description,
        published: new Date(data.published),
        title: data.title,
        link: data.link,
        created_at: new Date().toISOString(),
      } as unknown as CreateContentDto;
    });
    this.contentService.createMany(mapped);
    this.eventEmitter.emit("content.updated", new ContentUpdatedEvent(name));
    this.logger.log(rssData?.length);
  }

  deleteCron(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
    this.logger.warn(`job ${name} deleted!`);
  }

  deleteAllJobs() {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((task) => {
      task.stop();
    });
  }
  private getCronString(expression: string) {
    const randomMinute = Math.floor(Math.random() * 60);
    if (expression.includes("h")) {
      return `${randomMinute} */${expression.replace("h", "")} * * *`;
    } else if (expression.includes("m")) {
      return `${randomMinute} */${expression.replace("m", "")} * * * *`;
    } else {
      throw new Error("invalid time variant ");
    }
  }
}
