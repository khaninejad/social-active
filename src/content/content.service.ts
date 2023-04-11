import { Inject, Injectable } from "@nestjs/common";
import { CONTENT_MODEL } from "../app.const";
import { Content } from "./interfaces/content.interface";
import { Model } from "mongoose";
import { CreateContentDto } from "./dto/create-content.dto";

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

  async createMany(rssFeeds: CreateContentDto[]): Promise<any> {
    try {
      const options = { ordered: false };
      const createdContent = await this.contentModel.insertMany(
        rssFeeds,
        options
      );
      console.log(createdContent);
      return createdContent;
    } catch (error) {
      if (error.code === 11000) {
        console.log("Duplicate key error:", error.keyValue);
      } else {
        throw error;
      }
    }
}
}
