import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT;
if (!port) {
  throw new Error("PORT is not set");
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
}
bootstrap().then(() => {
  Logger.debug("main.ts", "🛠  bootstrapped application");
  Logger.debug(`Server is running on port ${port}`);
});
