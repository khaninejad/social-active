import * as mongoose from "mongoose";
export const AccountSchema = new mongoose.Schema({
  account: { type: String, unique: true, index: true },
  feeds: [String],
  config: { reminder: String },
  credentials: {
    TWITTER_CLIENT_ID: String,
    TWITTER_CLIENT_SECRET: String,
    callback: String,
  },
  access_token: String,
  refresh_token: String,
  expires_at: Number,
  scope: String,
  token_type: String,
  created_at: Date,
  updated_at: Date,
  status: String,
});
