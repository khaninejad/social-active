import { Prompt } from "./prompt.service";

describe("Rules", () => {
  let promptInstance;

  beforeEach(() => {
    promptInstance = new Prompt();
  });

  test("should add a role to the rules list", () => {
    promptInstance.addPrompt("test");
    expect(promptInstance.prompts.length).toBe(1);
  });

  test("should return a formatted list of roles", () => {
    promptInstance.addPrompt("dummy");
    promptInstance.addPrompt("lorem");
    const expectedOutput = "dummy\nlorem";
    expect(promptInstance.joinPrompt()).toBe(expectedOutput);
  });

  describe("getWebsiteName", () => {
    it("getWebsiteName valid request", () => {
      const res = promptInstance["getWebsiteName"]("http://example.com");
      expect(res).toBe("example");
    });
  });

  describe("getPrompt", () => {
    it("getPrompt valid request", () => {
      const res = promptInstance["getPrompt"]({
        title: "test",
        link: "https://google.com",
        description: "description",
        crawl: { url: "http://url.com" },
      });
      expect(res).toBeTruthy();
    });
  });
});
