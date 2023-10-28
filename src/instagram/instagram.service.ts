import { Inject, Injectable, Logger } from "@nestjs/common";
import { CreateInstagramDto } from "./dto/create-instagram.dto";
import { UpdateInstagramDto } from "./dto/update-instagram.dto";
import { INSTAGRAM_MODEL } from "../app.const";
import { Instagram } from "./entities/instagram.entity";
import { Model } from "mongoose";

@Injectable()
export class InstagramService {
  constructor(
    @Inject(INSTAGRAM_MODEL)
    private instagramModel: Model<Instagram>
  ) {}

  create(createInstagramDto: CreateInstagramDto) {
    const createdInstagram = this.instagramModel.findOneAndUpdate(
      {
        account: createInstagramDto.account,
        following: createInstagramDto.following,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        ...createInstagramDto,
      },
      { upsert: true }
    );
    return createdInstagram;
  }

  findAll() {
    return `This action returns all instagram`;
  }

  findAccount(account: string) {
    Logger.debug(account);
    return this.instagramModel.find({ account, status: "Following" }).exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} instagram`;
  }

  update(updateInstagramDto: UpdateInstagramDto) {
    const updatedInstagram = this.instagramModel.findOneAndUpdate(
      {
        account: updateInstagramDto.account,
        following: updateInstagramDto.following,
      },
      {
        ...updateInstagramDto,
        updated_at: new Date().toISOString(),
      },
      { upsert: true }
    );
    return updatedInstagram;
  }

  remove(id: number) {
    return `This action removes a #${id} instagram`;
  }
}
