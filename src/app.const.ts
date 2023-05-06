export const CONTENT_MODEL = "CONTENT_MODEL";
export const CONTENT_MODEL_NAME = "content";
export const DATABASE_CONNECTION = "DATABASE_CONNECTION";
export const ACCOUNT_MODEL = "ACCOUNT_MODEL";
export const ACCOUNT_MODEL_NAME = "account";

class configuration {
  getTwitterEnv() {
    if (
      process.env.TWITTER_CLIENT_ID &&
      process.env.TWITTER_CLIENT_SECRET &&
      process.env.TWITTER_CLIENT_CALLBACK
    ) {
      return {
        client_id: process.env.TWITTER_CLIENT_ID,
        client_secret: process.env.TWITTER_CLIENT_SECRET,
        callback: process.env.TWITTER_CLIENT_CALLBACK,
      };
    } else {
      throw new Error("twitter envs is not set");
    }
  }

  getWordpressEnv() {
    if (
      process.env.WORDPRESS_ENDPOINT &&
      process.env.WORDPRESS_USERNAME &&
      process.env.WORDPRESS_PASSWORD
    ) {
      return {
        endpoint: process.env.WORDPRESS_ENDPOINT,
        username: process.env.WORDPRESS_USERNAME,
        password: process.env.WORDPRESS_PASSWORD,
      };
    } else {
      throw new Error("WORDPRESS envs is not set");
    }
  }

  getOpenaiEnv() {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_MAX_TOKEN) {
      return {
        apiKey: process.env.OPENAI_API_KEY,
        max_token: parseInt(process.env.OPENAI_MAX_TOKEN) ?? 1224,
      };
    } else {
      throw new Error("OPENAI envs is not set");
    }
  }
}
export default new configuration();
