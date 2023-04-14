import { Inject, Injectable, Logger } from "@nestjs/common";
import { CONTENT_MODEL } from "../app.const";
import { Content } from "./interfaces/content.interface";
import { Model, ObjectId } from "mongoose";
import { CreateContentDto } from "./dto/create-content.dto";
import { UpdateCrawlDto } from "./dto/update-crawl.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";

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
        console.log("Duplicate key error:", error.keyValue);
      } else {
        throw error;
      }
    }
  }
  async getContentById(id: ObjectId): Promise<Content> {
    return this.contentModel.findById({ _id: id }).exec();
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
}
