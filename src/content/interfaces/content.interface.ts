import { Document } from "mongoose";

export interface Content extends Document {
  readonly account: string;
  readonly title: string;
  readonly link: string;
  readonly description: string;
  readonly published: Date;
}
