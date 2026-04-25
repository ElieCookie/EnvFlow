const {
  parseCsvList,
  sanitizeEnvName,
  splitHost,
  buildValuesConfig,
} = require("../src/commands/ctx/shared");

describe("ctx shared helpers", () => {
  test("parseCsvList trims and deduplicates", () => {
    expect(parseCsvList("a, b,a,,c")).toEqual(["a", "b", "c"]);
  });

  test("sanitizeEnvName enforces lowercase and hyphen", () => {
    expect(sanitizeEnvName("dev-123")).toBe("dev-123");
    expect(() => sanitizeEnvName("Dev_123")).toThrow();
  });

  test("splitHost parses path prefixes", () => {
    expect(splitHost("api.dev.example.com/payments")).toEqual({
      hostname: "api.dev.example.com",
      pathPrefix: "/payments",
    });
  });

  test("buildValuesConfig maps service host and port", () => {
    const values = buildValuesConfig({
      envName: "dev1",
      servicesConfig: {
        api: { port: 8080, host: "api.dev.example.com/v1" },
      },
    });

    expect(values.environmentName).toBe("dev1");
    expect(values.services[0]).toEqual({
      name: "dev1-api",
      port: 8080,
      hostname: "api.dev.example.com",
      pathPrefix: "/v1",
    });
  });
});
