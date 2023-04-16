import { Injectable, Logger } from "@nestjs/common";
import { Configuration, OpenAIApi } from "openai";
import { GeneratedBlogDto } from "./dto/generated-blog.dto";

@Injectable()
export class OpenAIService {
  private openai: OpenAIApi;

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
        max_tokens: 700,
      });
      const generated_content = completions.data.choices[0].text.trim();
      const clean_content = this.cleanString(
        this.escapeUrlsInJsonSchemaString(generated_content)
      );
      Logger.warn(`raw data ${clean_content}`);
      const extracted = this.extractJson(clean_content);
      return extracted;
    } catch (error) {
      Logger.error(`generateText error ${error}`);
    }
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
        .replace(/ +(?= )/g, "");
      return JSON.parse(jsonStr) as GeneratedBlogDto;
    } catch (error) {
      Logger.error(error);
      throw new Error("not contain valid json data");
    }
  }
  escapeUrlsInJsonSchemaString(input: string): string {
    const regex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi;
    const escapedBody = input.replace(regex, function (match, quote, url) {
      const escapedUrl = url.replace(/"/g, '\\"');
      return `<a href=\\"${escapedUrl}\\">`;
    });
    return escapedBody;
  }
}
