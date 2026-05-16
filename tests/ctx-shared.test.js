const path = require("path");
const {
  parseCsvList,
  sanitizeEnvName,
  splitHost,
  buildDevspaceConfig,
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

  test("buildDevspaceConfig wires deployments + dev blocks per service", () => {
    const cfg = buildDevspaceConfig({
      envName: "dev1",
      servicesConfig: {
        api: { port: 8080, command: "npm run dev" },
      },
      watchedServices: ["api"],
    });

    expect(cfg.name).toBe("dev1");
    expect(cfg.deployments.api.helm.chart.name).toMatch(/default-service$/);
    expect(cfg.deployments.api.helm.values.name).toBe("dev1-api");
    expect(cfg.deployments.api.helm.values.port).toBe(8080);
    expect(cfg.dev.api.ports[0].port).toBe("8080");
    expect(cfg.dev.api.sync[0].path).toContain("/api");
  });

  test("buildDevspaceConfig uses chart path from .sunrc when set", () => {
    const fakeChart = path.join(__dirname, "..", "src", "builtin-charts", "default-service");
    const cfg = buildDevspaceConfig({
      envName: "dev2",
      servicesConfig: {
        api: { port: 3000, chart: fakeChart },
      },
      watchedServices: [],
    });

    expect(cfg.deployments.api.helm.chart.name).toBe(fakeChart);
  });
});
