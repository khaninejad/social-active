import { Document } from "mongoose";

export interface Content extends Document {
  readonly account: string;
  readonly title: string;
  readonly link: string;
  readonly description: string;
  readonly published: Date;
  readonly crawl: {
    url: string;
    title: string;
    description: string;
    keyword: string;
    image: string;
    raw_text: string;
    crawl_date: Date;
  };
}
