import * as mongoose from "mongoose";

export const AccountSchema = new mongoose.Schema({
  account: String,
  access_token: String,
  refresh_token: String,
  expires_at: Number,
  created_at: Date,
  updated_at: Date,
});
