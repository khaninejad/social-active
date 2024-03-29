import { Inject, Injectable, Logger } from "@nestjs/common";
import { CONTENT_MODEL } from "../app.const";
import { Content } from "./interfaces/content.interface";
import { Model, ObjectId } from "mongoose";
import { CreateContentDto } from "./dto/create-content.dto";
import { UpdateCrawlDto } from "./dto/update-crawl.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";
import { UpdateGeneratedDto } from "./dto/update-generated.dto";
import { UpdateTweetDto } from "./dto/update-tweet.dto";

@Injectable()
export class ContentService {
  constructor(
    @Inject(CONTENT_MODEL)
    private contentModel: Model<Content>
  ) {}

  async create(createContentDto: CreateContentDto): Promise<Content> {
    const createdContent = await this.contentModel.create(createContentDto);
    return createdContent;
  }

  async findAll(): Promise<Content[]> {
    return this.contentModel.find().exec();
  }

  async getContentsByAccountNameForCrawl(
    accountName: string
  ): Promise<Content[]> {
    return this.contentModel
      .find({ account: accountName, crawl: { $exists: false } })
      .exec();
  }

  async createMany(rssFeeds: CreateContentDto[]): Promise<any> {
    try {
      const options = { ordered: false };
      const createdContent = await this.contentModel.insertMany(
        rssFeeds,
        options
      );
      return createdContent;
    } catch (error) {
      if (error.code === 11000) {
        Logger.log("duplicate content");
      } else {
        throw error;
      }
    }
  }
  async getContentById(id: ObjectId): Promise<Content> {
    return this.contentModel.findById({ _id: id }).exec();
  }

  async deleteOldContent(day: number): Promise<number> {
    try {
      const today = new Date();
      today.setDate(today.getDate() - day);

      const deletedContent = await this.contentModel.deleteMany({
        created_at: { $lt: today },
      });

      return deletedContent.deletedCount;
    } catch (error) {
      throw error;
    }
  }

  async updateCrawl(updateCrawlDto: UpdateCrawlDto): Promise<Content> {
    Logger.debug(updateCrawlDto.id);
    const updated = this.contentModel.findByIdAndUpdate(
      updateCrawlDto.id,
      { crawl: updateCrawlDto.crawl },
      { upsert: true }
    );
    return updated;
  }

  async updatePublish(updateBlogDto: UpdateBlogDto): Promise<Content> {
    Logger.debug(updateBlogDto.id);
    const updated = this.contentModel.findByIdAndUpdate(
      updateBlogDto.id,
      { blog: updateBlogDto.blog },
      { upsert: true }
    );
    return updated;
  }

  async updateGenerated(
    updateGeneratedDto: UpdateGeneratedDto
  ): Promise<Content> {
    Logger.debug(updateGeneratedDto);
    const updated = this.contentModel.findByIdAndUpdate(
      updateGeneratedDto.id,
      { generated: updateGeneratedDto.generated },
      { upsert: true }
    );
    return updated;
  }

  async updateTweet(updateTweetDto: UpdateTweetDto): Promise<Content> {
    const updated = this.contentModel.findByIdAndUpdate(
      updateTweetDto.id,
      { tweet: updateTweetDto.Tweet },
      { upsert: true }
    );
    return updated;
  }
}
