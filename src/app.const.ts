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
}
export default new configuration();
