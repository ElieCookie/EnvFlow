const { promptFunction } = require("../../src/utils/prompt");

describe("prompt utility", () => {
  test("resolves a prompt function from the installed inquirer package", () => {
    expect(typeof promptFunction()).toBe("function");
  });
});
