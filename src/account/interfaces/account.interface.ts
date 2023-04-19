import { Document } from "mongoose";

export interface Account extends Document {
  readonly account: string;
  readonly feeds: [string];
  readonly config: { reminder: string };
  readonly credentials: {
    client_id: string;
    client_secret: string;
    callback: string;
  };
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_at: string;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly status: string;
}
