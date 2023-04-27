import { Rules } from "./rule.service";

describe("Rules", () => {
  let rules;

  beforeEach(() => {
    rules = new Rules();
  });

  test("should add a role to the rules list", () => {
    rules.addRole("admin");
    expect(rules.rules.length).toBe(1);
  });

  test("should return a formatted list of roles", () => {
    rules.addRole("admin");
    rules.addRole("moderator");
    const expectedOutput = "admin\nmoderator";
    expect(rules.getRoles()).toBe(expectedOutput);
  });
});
