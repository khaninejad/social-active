import * as mongoose from "mongoose";

const ContentSchema = new mongoose.Schema({
  account: String,
  title: String,
  link: String,
  description: String,
  published: String,
});

ContentSchema.index({ account: 1, title: 1, link: 1 }, { unique: true });
export default ContentSchema;
