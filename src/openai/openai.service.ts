import { Injectable, Logger } from "@nestjs/common";
import { Configuration, OpenAIApi } from "openai";
import { GeneratedBlogDto } from "./dto/generated-blog.dto";

@Injectable()
export class OpenAIService {
  private openai: OpenAIApi;
  private readonly logger: Logger = new Logger(OpenAIApi.name);

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async generateText(prompt: string): Promise<GeneratedBlogDto> {
    try {
      const completions = await this.openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        n: 1,
        top_p: 1,
        temperature: 0.2,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKEN) ?? 1224,
      });
      const generated_content = completions.data.choices[0].text.trim();
      const clean_content = this.cleanString(generated_content);
      this.logger.warn(`raw data ${clean_content}`);
      const extracted = this.extractJson(
        this.escapeQuotesInATags(clean_content)
      );
      return extracted;
    } catch (error) {
      this.logger.error(`generateText error ${error}`);
    }
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

  escapeQuotesInATags(str: string): string {
    const regex = /<a[^>]*>[^<]*<\/a>/gi;
    return str.replace(regex, (match) => {
      return match.replace(/"/g, '\\"');
    });
  }
}
