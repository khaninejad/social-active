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
      Logger.warn(`raw data ${generated_content}`);
      const extracted = this.extractJson(generated_content);
      return extracted;
    } catch (error) {
      Logger.error(error);
    }
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
}
