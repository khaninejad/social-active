export const CONTENT_MODEL = "CONTENT_MODEL";
export const CONTENT_MODEL_NAME = "content";
export const DATABASE_CONNECTION = "DATABASE_CONNECTION";
export const ACCOUNT_MODEL = "ACCOUNT_MODEL";
export const ACCOUNT_MODEL_NAME = "account";

class configuration {
  getTwitterEnv() {
    if (
      process.env.CLIENT_ID &&
      process.env.CLIENT_SECRET &&
      process.env.CLIENT_CALLBACK
    ) {
      return {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        callback: process.env.CLIENT_CALLBACK,
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
        client_id: process.env.WORDPRESS_ENDPOINT,
        client_secret: process.env.WORDPRESS_USERNAME,
        callback: process.env.WORDPRESS_PASSWORD,
      };
    } else {
      throw new Error("WORDPRESS envs is not set");
    }
  }
}
export default new configuration();
