import { Connection } from "mongoose";
import { ContentSchema } from "./content.schema";
import {
  CONTENT_MODEL,
  CONTENT_MODE_NAME,
  DATABASE_CONNECTION,
} from "src/app.const";

export const contentsProviders = [
  {
    provide: CONTENT_MODEL,
    useFactory: (connection: Connection) =>
      connection.model(CONTENT_MODE_NAME, ContentSchema),
    inject: [DATABASE_CONNECTION],
  },
];
