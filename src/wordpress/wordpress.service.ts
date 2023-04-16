import { Injectable, Logger } from "@nestjs/common";
import * as WPAPI from "wpapi";
import axios from "axios";
import { WordpressResponse } from "./dto/wordpress-response.dto";

@Injectable()
export class WordpressService {
  wp: WPAPI;
  constructor() {
    this.wp = new WPAPI({
      endpoint: process.env.WORDPRESS_ENDPOINT,
      username: process.env.WORDPRESS_USERNAME,
      password: process.env.WORDPRESS_PASSWORD,
    });
  }

  async createPost(
    title: string,
    content: string,
    media_url: string
  ): Promise<WordpressResponse> {
    try {
      const media = await this.uploadMedia(media_url, title);
      const categoryIds = await this.getCategoryIds(["test", "hello world"]);
      const tagIds = await this.getTagIds(["tags", "test tags", "new tags"]);
      Logger.error(
        `uploaded media ${
          media?.id
        } and url ${media_url} tags: ${JSON.stringify(tagIds)}`
      );
      const res = await this.wp.posts().create({
        title,
        content,
        featured_media: media?.id ?? undefined,
        categories: categoryIds ?? undefined,
        tags: tagIds ?? undefined,
        status: "private",
      });
      return res as WordpressResponse;
    } catch (error) {
      Logger.error(error);
    }
  }

  async uploadMedia(mediaUrl: string, title: string) {
    try {
      const response = await axios.get(mediaUrl, {
        responseType: "arraybuffer",
      });
      const imageBuffer = Buffer.from(response.data, "binary");
      const uploadedImage = await this.wp
        .media()
        .file(imageBuffer, this.renameFileWithPath(mediaUrl, title))
        .create({
          title: title,
        });
      return uploadedImage;
    } catch (error) {
      Logger.error(error);
    }
  }
  async getCategoryIds(categoryNames: string[]): Promise<number[]> {
    const categoryIds: number[] = [];

    try {
      for (const name of categoryNames) {
        let category = await this.wp
          .categories()
          .slug(this.titleToSlug(name))
          .get();
        if (category.length === 0) {
          category = await this.wp.categories().create({
            name: name,
            slug: this.titleToSlug(name),
            description: "",
          });
        }
        categoryIds.push(category[0].id);
      }
    } catch (error) {
      Logger.error(error);
    }

    return categoryIds;
  }

  async getTagIds(tagNames: string[]): Promise<number[]> {
    const tagIds: number[] = [];

    try {
      for (const tagItem of tagNames) {
        const tag = await this.wp.tags().slug(this.titleToSlug(tagItem));
        if (tag.length === 0) {
          const newTag = await this.wp.tags().create({
            name: tagItem,
            slug: this.titleToSlug(tagItem),
          });
          tagIds.push(newTag[0].id);
        } else {
          tagIds.push(tag[0].id);
        }
      }
    } catch (error) {
      Logger.error(error);
    }

    return tagIds;
  }

  private renameFileWithPath(filePath: string, title: string): string {
    const pathArr = filePath.split("/");
    const fileName = pathArr.pop();
    if (!fileName) {
      throw new Error("File path is invalid");
    }
    const ext = fileName.split(".").pop();
    if (!ext) {
      throw new Error("File extension is invalid");
    }
    const newFileName = `${title}.${ext}`;
    pathArr.push(newFileName);
    return pathArr.join("/");
  }

  private titleToSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-");
  }
}
