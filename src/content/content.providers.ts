import { Connection } from "mongoose";
import {
  CONTENT_MODEL,
  CONTENT_MODEL_NAME,
  DATABASE_CONNECTION,
} from "../app.const";
import ContentSchema from "./schema/content.schema";

export const contentsProviders = [
  {
    provide: CONTENT_MODEL,
    useFactory: (connection: Connection) =>
      connection.model(CONTENT_MODEL_NAME, ContentSchema),
    inject: [DATABASE_CONNECTION],
  },
];
