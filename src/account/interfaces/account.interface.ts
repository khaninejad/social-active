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
  readonly token: {
    access_token: string;
    refresh_token: string;
    expires_at: string;
    scope: string;
    token_type: string;
  };
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly status: string;
}
