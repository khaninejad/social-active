import { OpenAIService } from "./openai.service";
process.env.OPENAI_API_KEY = "api-key";
process.env.OPENAI_MAX_TOKEN = "1234";

describe("OpenAIService", () => {
  let openaiService: OpenAIService;
  let createCompletionMock: jest.Mock;
  let createChatCompletionMock: jest.Mock;
  let logger: jest.SpyInstance;

  beforeEach(() => {
    createCompletionMock = jest.fn();
    createChatCompletionMock = jest.fn();
    openaiService = new OpenAIService();
    openaiService["openai"] = {
      createChatCompletion: createChatCompletionMock,
      createCompletion: createCompletionMock,
    } as any;

    process.env.OPENAI_MAX_TOKEN = "1500";
    process.env.OPENAI_API_KEY = "api-key";
    logger = jest.spyOn(openaiService["logger"], "error");
  });

  describe("generateText", () => {
    it("should call createCompletion with correct arguments", async () => {
      process.env.OPENAI_MODEL = "text-davinci-003";
      const prompt = "Test text prompt";

      jest
        .spyOn(openaiService, "generateTextCompletion")
        .mockResolvedValue(prompt);
      jest.spyOn(openaiService, "extractJson").mockImplementation();
      jest.spyOn(openaiService, "cleanString").mockReturnValue(prompt);
      jest.spyOn(openaiService, "escapeATags").mockReturnValue(prompt);

      await openaiService.generateText(prompt);

      expect(openaiService.generateTextCompletion).toHaveBeenCalledWith(prompt);
      expect(openaiService.extractJson).toHaveBeenCalledWith(prompt);
      expect(openaiService.cleanString).toHaveBeenCalledWith(prompt);
      expect(openaiService.escapeATags).toHaveBeenCalledWith(prompt);
    });

    it("should call createCompletion with incorrect arguments", async () => {
      createCompletionMock.mockResolvedValue({
        data: {
          choices: [{ text: `{"hello": "world"}` }],
        },
      });

      const prompt = "Test prompt";
      jest
        .spyOn(openaiService["openai"], "createCompletion")
        .mockRejectedValueOnce(new Error(""));
      await openaiService.generateText(prompt);

      expect(logger).toHaveBeenCalledWith("generateText error: {}");
    });

    it("should call createCompletion with correct arguments", async () => {
      process.env.OPENAI_MODEL = "gpt-3.5-turbo";
      jest.spyOn(openaiService, "generateChatCompletion").mockImplementation();

      const prompt = "Test chat prompt";
      await openaiService.generateText(prompt);

      expect(openaiService.generateChatCompletion).toHaveBeenCalledWith(prompt);
    });
  });

  describe("extractJson", () => {
    it("should return valid object", () => {
      const res = openaiService.extractJson('{"hello": true}');
      expect(res).toStrictEqual({ hello: true });
    });

    it("should return valid object with pre text ", () => {
      const res = openaiService.extractJson('ok ok ok {"hello": true}');
      expect(res).toStrictEqual({ hello: true });
    });

    it("should return valid object with suf text ", () => {
      const res = openaiService.extractJson('{"hello": true} ok ok ok ');
      expect(res).toStrictEqual({ hello: true });
    });

    it("should return valid object with both side text ", () => {
      const res = openaiService.extractJson(
        'ok ok ok {"hello": true} ok ok ok '
      );
      expect(res).toStrictEqual({ hello: true });
    });

    it("should return valid object without pair bracket", () => {
      expect(() => {
        openaiService.extractJson('ok ok ok {"hello": true ok ok ok ');
      }).toThrow("not contain valid json data");
    });

    it("should return valid object without pair bracket", () => {
      expect(() => {
        openaiService.extractJson(`{
          "title": "Bird Flu Mutations: Are Humans at Risk of Contracting Avian Flu?"
          "body": "The recent finding of two genetic
          For more information, visit the Centers for Disease Control and Prevention’s website. https://www.cdc.gov/flu/avianflu/h5n1-virus.htm",
          "category": "Health",
          "tags": "Avian Flu, Bird Flu, Genetic Mutations, Risk to Humans"
        }`);
      }).not.toThrow("not contain valid json data");
    });

    it("should return valid object without pair bracket", () => {
      expect(() => {
        openaiService.extractJson(
          `{    "title": "Aaron Rodgers Introduced as New York Jets Quarterback",    "category": "Sports",    "tags": "Aaron Rodgers, New York Jets, NFL, Super Bowl, Joe Namath",    "body": "<p>Four-time NFL MVP and Super Bowl XLV champion Aaron Rodgers was introduced Wednesday as the New York Jets' newest signal-caller. \"This is a surreal day for me after spending 18 years in the same city,\" the Jets quarterback told reporters. \"I'm here because I believe in this team. I believe in (head coach Robert Saleh). I believe in the direction of (Jets general manager Joe Douglas).</p><p>\"Obviously, he has drafted very well the last couple of years. Obviously, a big thanks to the Green Bay Packers organization for an incredible run. That chapter is over now and I'm excited about the new adventure here in New York.\"</p><p>He added: \"I'm an old guy, so I want to be a part of a team that can win it all and I believe this is a place where we can get that done.\"</p><p>Rodgers said he noticed walking into the Jets' facility Wednesday morning that the Jets' only Super Bowl trophy was \"looking a little lonely.\" The Green Bay Packers traded their long-time quarterback to the Jets along with the Packers' 15th overall pick and fifth-round choice in Thursday's NFL Draft.</p><p>The Packers will receive the Jets' 13th overall selection, one of the Jets' second-round picks, a sixth-round pick and their 2024 first-round draft pick if Rodgers plays at least 65% of the Jets' offensive plays this upcoming season, <a href=\"https://www.espn.com/nfl/story/_/id/31222862/new-jets-qb-aaron-rodgers-super-bowl-iii-trophy-looks-lonely\" target=\"_blank\" rel=\"noopener noreferrer\">according to ESPN</a>.</p><p>Rodgers jokingly said he knew that the Jets would be the next team he played for after the Jets \"smoked\" the Packers last season.</p><p>Rodgers addressed his intentions of playing for the Jets beyond the 2023 season. \"Right now, I'm just going to focus on this season,\" he said. \"I'm excited about being here, expect to be here for the duration of the offseason.\"</p><p>Rodgers went on to say: \"I'm going to be here for the foreseeable future.\" After the press conference, Rodgers held up his new green and white No. 8 jersey.</p><p>The 39-year-old said he heard Jets legend Pro Football Hall of Famer Joe Namath mention that he would be okay if the Jets unretired the iconic No. 12 Namath jersey for Rodgers, but the new Jets quarterback said: \"To me, 12 is Broadway Joe.\"</p><p>Rodgers has spent his entire 18-season career with Green Bay, leading the team to a 31-25 victory against the Pittsburgh Steelers in Super Bowl XLV in 2011.</p><p>The Jets finished with a 7-10 record last season, missing the playoffs for the 12th consecutive year. <a href=\"https://amp.cnn.com/cnn/2023/04/27/sport/aaron-rodgers-introduced-new-york-jets-spt-intl/index.html\" target=\"_blank\" rel=\"noopener noreferrer\">Source: CNN</a></p>"}`
        );
      }).toThrow("not contain valid json data");
    });
  });

  it("countTokens", () => {
    const res = openaiService.countTokens(
      "Bird Flu Mutations: Are Humans at Risk of Contracting Avian Flu"
    );
    expect(res).toBe(11);
  });

  it("escapeQuotesInATags", () => {
    const res = openaiService.escapeATags(
      `<html><body><p>this is a text<a href="https://originallink.com">this is a link</a></p></body></html`
    );
    expect(res).toBe(
      `<html><body><p>this is a text<a href=\"https://originallink.com\">this is a link</a></p></body></html`
    );
  });

  it("escapeJsonString is valid", () => {
    const res = openaiService["escapeJsonString"](`test content "  \ { 
    }    
    }`);
    expect(res).toBe(`test content \\\"   { \\n    }    \\n    }`);
  });

  describe("openai completion", () => {
    it("should call generateTextCompletion with correct arguments", async () => {
      process.env.OPENAI_MODEL = "text-davinci-003";
      createCompletionMock.mockResolvedValue({
        data: {
          choices: [{ text: `{"hello": "world"}` }],
        },
      });

      const prompt = "Test prompt";
      const generatedText = await openaiService.generateTextCompletion(prompt);

      expect(createCompletionMock).toHaveBeenCalledWith(
        {
          frequency_penalty: 0,
          presence_penalty: 0,
          model: "text-davinci-003",
          prompt,
          n: 1,
          temperature: 0.2,
          top_p: 1,
          max_tokens: openaiService.calculateMaxToken(prompt),
        },
        { headers: { "Content-Type": "application/json", charset: "utf-8" } }
      );
      expect(generatedText).toEqual(`{\"hello\": \"world\"}`);
    });

    it("should call generateChatCompletion with correct arguments", async () => {
      process.env.OPENAI_MODEL = "text-003";
      createChatCompletionMock.mockResolvedValue({
        data: {
          choices: [{ message: { content: "this is output" } }],
        },
      });

      const prompt = "Test prompt";
      const generatedText = await openaiService.generateChatCompletion(prompt);

      expect(createChatCompletionMock).toHaveBeenCalledWith(
        {
          frequency_penalty: 0,
          presence_penalty: 0,
          model: "text-003",
          messages: [{ role: "system", content: prompt }],
          n: 1,
          temperature: 0.2,
          top_p: 1,
          max_tokens: openaiService.calculateMaxToken(prompt),
        },
        { headers: { "Content-Type": "application/json", charset: "utf-8" } }
      );
      expect(generatedText).toEqual(`this is output`);
    });
  });
});
