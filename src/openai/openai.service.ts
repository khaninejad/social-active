import { Injectable, Logger } from "@nestjs/common";
import { Configuration, OpenAIApi } from "openai";
import { GeneratedBlogDto } from "./dto/generated-blog.dto";
import envConfiguration from "../app.const";

@Injectable()
export class OpenAIService {
  private openai: OpenAIApi;
  private readonly logger: Logger = new Logger(OpenAIApi.name);

  constructor() {
    const configuration = new Configuration(envConfiguration.getOpenAiEnv());
    this.openai = new OpenAIApi(configuration);
  }

  async generateText(prompt: string): Promise<GeneratedBlogDto> {
    try {
      this.logger.log(
        `Started to generate text using ${
          envConfiguration.getOpenAiEnv().model
        } model with ${envConfiguration.getOpenAiEnv().max_token} max-token`
      );
      this.logger.error(this.escapeJsonString(prompt));
      let generated_content = "";
      if (envConfiguration.getOpenAiEnv().model.includes("davinci")) {
        generated_content = await this.generateTextCompletion(
          this.escapeJsonString(prompt)
        );
      } else {
        generated_content = await this.generateChatCompletion(
          this.escapeJsonString(prompt)
        );
      }

      this.logger.error(JSON.stringify(generated_content));
      const clean_content = this.cleanString(generated_content);
      this.logger.warn(`raw data ${clean_content}`);
      const extracted = this.extractJson(this.escapeATags(clean_content));
      return extracted;
    } catch (error) {
      this.logger.error(`generateText error: ${JSON.stringify(error)}`);
    }
  }
  async generateTextCompletion(prompt: string) {
    this.logger.log(`generateTextCompletion`);
    const completions = await this.openai.createCompletion(
      {
        model: envConfiguration.getOpenAiEnv().model,
        prompt: prompt,
        n: 1,
        top_p: 1,
        temperature: 0.2,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: envConfiguration.getOpenAiEnv().max_token,
      },
      { headers: { "Content-Type": "application/json", charset: "utf-8" } }
    );
    return completions.data.choices[0].text.trim();
  }

  async generateChatCompletion(prompt: string) {
    this.logger.log(`generateChatCompletion`);
    const completions = await this.openai.createChatCompletion(
      {
        model: envConfiguration.getOpenAiEnv().model,
        messages: [{ role: "system", content: prompt }],
        n: 1,
        top_p: 1,
        temperature: 0.2,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: envConfiguration.getOpenAiEnv().max_token,
      },
      { headers: { "Content-Type": "application/json", charset: "utf-8" } }
    );
    return completions.data.choices[0].message.content;
  }

  escapeJsonString(str: string): string {
    // define the characters that need to be escaped
    const charsToEscape: { [char: string]: string } = {
      "\b": "\\b",
      "\f": "\\f",
      "\n": "\\n",
      "\r": "\\r",
      "\t": "\\t",
      '"': '\\"',
      "\\": "\\\\",
    };

    // iterate through each character in the string and replace if necessary
    return str.replace(
      /[\b\f\n\r\t"\\]/g,
      (match: string) => charsToEscape[match]
    );
  }

  countTokens(str: string): number {
    const tokens = str.trim().split(/\s+/);
    return tokens.length;
  }

  cleanString(str: string): string {
    return str.replace(/[\n\t]/g, "").trim();
  }

  extractJson(str: string): GeneratedBlogDto {
    try {
      const start = str.indexOf("{");
      const end = str.lastIndexOf("}") + 1;
      if (end === 0) {
        str += `"}`;
      }
      const jsonStr = str
        .slice(start, end)
        .replace(/\n/g, "")
        .replace(/ +(?= )/g, "")
        .replace(`" "body"`, `", "body"`);
      return JSON.parse(jsonStr) as GeneratedBlogDto;
    } catch (error) {
      this.logger.error(`extractJson ${error}`);
      throw new Error("not contain valid json data");
    }
  }

  escapeATags(str: string): string {
    const regex = /<a([^>]+)>[^<]*<\/a>/gi;
    return str.replace(regex, (match) => {
      return match.replace(/(")(?=[^>]*<)/g, '\\"');
    });
  }
}
