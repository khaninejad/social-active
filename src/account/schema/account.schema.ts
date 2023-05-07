import * as mongoose from "mongoose";
export const AccountSchema = new mongoose.Schema({
  account: { type: String, unique: true, index: true },
  feeds: [String],
  config: { reminder: String },
  credentials: {
    client_id: String,
    client_secret: String,
    callback: String,
  },
  twitter: {
    id: String,
    username: String,
    name: String,
    url: String,
    description: String,
    profile_image_url: String,
    location: String,
    verified: String,
    created_at: String,
  },
  token: {
    access_token: String,
    refresh_token: String,
    expires_at: Number,
    scope: String,
    token_type: String,
  },
  created_at: Date,
  updated_at: Date,
  status: String,
});
