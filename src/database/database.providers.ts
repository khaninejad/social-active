import * as mongoose from "mongoose";

export const databaseProviders = [
  {
    provide: "DATABASE_CONNECTION",
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect("mongodb://mongoadmin:secret@mongo:27017/social-active"),
  },
];
