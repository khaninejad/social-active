import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";

process.env.WORDPRESS_ENDPOINT = "http://ok.com";
process.env.WORDPRESS_USERNAME = "username";
process.env.WORDPRESS_PASSWORD = "password";

process.env.CLIENT_ID = "client";
process.env.CLIENT_SECRET = "secret";
process.env.CLIENT_CALLBACK = "http://exampl.com/callback";

process.env.OPENAI_API_KEY = "api-key";
process.env.OPENAI_MAX_TOKEN = "1234";
process.env.OPENAI_API_KEY = "api-key";
process.env.MONGODB_CONNECTION_STRING =
  "mongodb://mongoadmin:secret@localhost:27017/?authMechanism=DEFAULT";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer()).get("/account").expect(200).expect([]);
  });
});
