import { Injectable, Logger } from "@nestjs/common";
import { Configuration, OpenAIApi } from "openai";

@Injectable()
export class OpenAIService {
  private openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async generateText(prompt: string): Promise<string> {
    try {
      // const completions = await this.openai.createCompletion({
      //   model: "text-davinci-003",
      //   prompt,
      // });
      // Logger.debug(completions.data.choices[0]);
      // return completions.data.choices[0].text.trim();
      return 'ok';
    } catch (error) {
      Logger.error(error);
    }
  }
}
