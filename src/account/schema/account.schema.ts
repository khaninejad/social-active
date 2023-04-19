import * as mongoose from "mongoose";
export const AccountSchema = new mongoose.Schema({
  account: { type: String, unique: true, index: true },
  feeds: [String],
  config: { reminder: String },
  credentials: { client_id: String, client_secret: String, callback: String },
  access_token: String,
  refresh_token: String,
  expires_at: Number,
  created_at: Date,
  updated_at: Date,
  status: String,
});
