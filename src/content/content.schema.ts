import * as mongoose from "mongoose";

export const ContentSchema = new mongoose.Schema({
  account: String,
  title: String,
  link: String,
  description: String,
  published: String,
});
