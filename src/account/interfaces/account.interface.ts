import { Document } from "mongoose";

export interface Account extends Document {
  readonly account: string;
  readonly feeds: [string];
  readonly config: { reminder: string };
  readonly credentials: {
    TWITTER_CLIENT_ID: string;
    TWITTER_CLIENT_SECRET: string;
    callback: string;
  };
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_at: string;
  readonly scope: string;
  readonly token_type: string;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly status: string;
}
