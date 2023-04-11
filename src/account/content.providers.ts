import { Connection } from "mongoose";
import {
  ACCOUNT_MODEL,
  ACCOUNT_MODEL_NAME,
  DATABASE_CONNECTION,
} from "src/app.const";
import { AccountSchema } from "./schema/content.schema";

export const accountsProviders = [
  {
    provide: ACCOUNT_MODEL,
    useFactory: (connection: Connection) =>
      connection.model(ACCOUNT_MODEL_NAME, AccountSchema),
    inject: [DATABASE_CONNECTION],
  },
];
