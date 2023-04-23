import { OpenAIService } from "./openai.service";

describe("OpenAIService", () => {
  let openaiService: OpenAIService;
  let createCompletionMock: jest.Mock;

  beforeEach(() => {
    createCompletionMock = jest.fn();
    openaiService = new OpenAIService();
    openaiService["openai"] = {
      createCompletion: createCompletionMock,
    } as any;
  });

  describe("generateText", () => {
    it("should call createCompletion with correct arguments", async () => {
      createCompletionMock.mockResolvedValue({
        data: {
          choices: [{ text: `{"hello": "world"}` }],
        },
      });

      const prompt = "Test prompt";
      const generatedText = await openaiService.generateText(prompt);

      expect(createCompletionMock).toHaveBeenCalledWith({
        frequency_penalty: 0,
        presence_penalty: 0,
        model: "text-davinci-003",
        prompt,
        n: 1,
        temperature: 0.2,
        top_p: 1,
        max_tokens: 1224,
      });
      expect(generatedText).toEqual({ hello: "world" });
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
      }).toThrow("not contain valid json data");
    });
  });
});
