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
    this.fetchFeeds().then(() => "tasks started");
  }
  async fetchFeeds() {
    const accounts = await this.accountService.getAll();
    accounts.forEach((item) => {
      this.addCronJob(item.account, item.config.reminder, item.feeds);
    });
  }

  addCronJob(name: string, time: string, feeds: string[]) {
    const job = new CronJob(this.getCronString(time), async () => {
      this.logger.warn(`time (${time}) for job ${name} to run!`);
      const rssData = await this.rssService.fetch(feeds);
      const mapped = rssData.map((data) => {
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
      this.logger.log(rssData.length);
    });

    this.schedulerRegistry.addCronJob(name, job);
    job.start();

    this.logger.warn(`job ${name} added for each time at ${time}!`);
  }

  deleteCron(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
    this.logger.warn(`job ${name} deleted!`);
  }
  private getCronString(expression: string) {
    if (expression.includes("h")) {
      return `* * */${expression.replace("h", "")} 9-17 * *`;
    } else if (expression.includes("m")) {
      return `0 */${expression.replace("m", "")} * * * *`;
    } else {
      throw new Error("invalid time variant ");
    }
  }
}
