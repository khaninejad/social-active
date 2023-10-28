import { Connection } from "mongoose";
import {
  DATABASE_CONNECTION,
  INSTAGRAM_MODEL,
  INSTAGRAM_MODEL_NAME,
} from "../app.const";
import { InstagramSchema } from "./schema/instagram.schema";

export const instagramProviders = [
  {
    provide: INSTAGRAM_MODEL,
    useFactory: (connection: Connection) =>
      connection.model(INSTAGRAM_MODEL_NAME, InstagramSchema),
    inject: [DATABASE_CONNECTION],
  },
];
