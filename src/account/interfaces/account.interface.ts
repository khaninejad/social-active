import { Document } from "mongoose";

export interface Account extends Document {
  readonly account: string;
  readonly feeds: [string];
  readonly config: { reminder: string };
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_at: string;
  readonly created_at: Date;
  readonly updated_at: Date;
}
