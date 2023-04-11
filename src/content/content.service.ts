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
}
