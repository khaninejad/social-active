import * as mongoose from "mongoose";
import { DATABASE_CONNECTION } from "../app.const";

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(process.env.MONGODB_CONNECTION_STRING),
  },
];
