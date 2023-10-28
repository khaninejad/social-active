import * as mongoose from "mongoose";
export const InstagramSchema = new mongoose.Schema({
  account: { type: String, index: true },
  following: String,
  created_at: Date,
  updated_at: Date,
  status: String,
});
