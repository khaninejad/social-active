import * as mongoose from "mongoose";

const ContentSchema = new mongoose.Schema({
  account: String,
  title: String,
  link: String,
  description: String,
  published: String,
  created_at: Date,
});

ContentSchema.index({ account: 1, title: 1, link: 1 }, { unique: true });
export default ContentSchema;
