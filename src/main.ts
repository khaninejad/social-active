import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT;
if (!port) {
  throw new Error("PORT is not set");
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle("Social Active Api")
    .setDescription("Social active api list")
    .setVersion("1.0")
    .addTag("social-active")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
  await app.listen(port);
}
bootstrap().then(() => {
  Logger.debug("main.ts", "🛠  bootstrapped application");
  Logger.debug(`Server is running on port ${port}`);
});
