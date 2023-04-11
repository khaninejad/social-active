import * as mongoose from "mongoose";
mongoose.set("debug", true);
export const AccountSchema = new mongoose.Schema({
  account: { type: String, unique: true, index: true },
  access_token: String,
  refresh_token: String,
  expires_at: Number,
  created_at: Date,
  updated_at: Date,
});
