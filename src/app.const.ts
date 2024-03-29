export const CONTENT_MODEL = "CONTENT_MODEL";
export const CONTENT_MODEL_NAME = "content";
export const DATABASE_CONNECTION = "DATABASE_CONNECTION";
export const ACCOUNT_MODEL = "ACCOUNT_MODEL";
export const ACCOUNT_MODEL_NAME = "account";
export const INSTAGRAM_MODEL = "INSTAGRAM_MODEL";
export const INSTAGRAM_MODEL_NAME = "instagram";
class Configuration {
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

  getOpenAiEnv() {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_MAX_TOKEN) {
      return {
        apiKey: process.env.OPENAI_API_KEY,
        max_token: parseInt(process.env.OPENAI_MAX_TOKEN) ?? 1224,
        model: process.env.OPENAI_MODEL ?? "text-davinci-003",
      };
    } else {
      throw new Error("OPENAI envs is not set");
    }
  }
}
export default new Configuration();
