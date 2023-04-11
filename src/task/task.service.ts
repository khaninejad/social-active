import { Injectable, Logger } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { AccountService } from "../account/account.service";
import { RssService } from "../rss/rss.service";
import { ContentService } from "../content/content.service";
import { CreateContentDto } from "../content/dto/create-content.dto";

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly accountService: AccountService,
    private readonly rssService: RssService,
    private readonly contentService: ContentService
  ) {
    this.fetchFeeds().then(() => "tasks started");
  }
  async fetchFeeds() {
    const accounts = await this.accountService.getAll();
    accounts.forEach((item) => {
      this.addCronJob(
        item.account,
        item.config.reminder.replace("h", ""),
        item.feeds
      );
    });
  }

  addCronJob(name: string, hours: string, feeds: string[]) {
    // const job = new CronJob(`0 0 */${hours} 9-17 * *`, async () => {
    const job = new CronJob(`0 */${hours} * 9-17 * *`, async () => {
      this.logger.warn(`time (${hours}) for job ${name} to run!`);
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
      this.logger.log(rssData.length);
    });

    this.schedulerRegistry.addCronJob(name, job);
    job.start();

    this.logger.warn(`job ${name} added for each hour at ${hours}!`);
  }

  deleteCron(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
    this.logger.warn(`job ${name} deleted!`);
  }
}
