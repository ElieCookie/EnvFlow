const path = require("path");
const fs = require("fs");
const os = require("os");
const {
  parseCsvList,
  sanitizeEnvName,
  splitHost,
  buildDevspaceConfig,
} = require("../src/commands/ctx/shared");

describe("ctx shared helpers", () => {
  let tmpChart;

  beforeAll(() => {
    tmpChart = fs.mkdtempSync(path.join(os.tmpdir(), "envflow-chart-"));
    fs.writeFileSync(
      path.join(tmpChart, "Chart.yaml"),
      "apiVersion: v2\nname: stub\nversion: 0.0.1\n",
    );
  });

  afterAll(() => {
    fs.rmSync(tmpChart, { recursive: true, force: true });
  });

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
        api: { port: 8080, command: "npm run dev", chart: tmpChart },
      },
      watchedServices: ["api"],
    });

    expect(cfg.name).toBe("dev1");
    expect(cfg.deployments.api.helm.chart.name).toBe(tmpChart);
    expect(cfg.deployments.api.helm.values.name).toBe("dev1-api");
    expect(cfg.deployments.api.helm.values.port).toBe(8080);
    expect(cfg.dev.api.ports[0].port).toBe("8080");
    expect(cfg.dev.api.sync[0].path).toContain("/api");
  });

  test("buildDevspaceConfig throws when service has no chart", () => {
    expect(() =>
      buildDevspaceConfig({
        envName: "dev2",
        servicesConfig: { api: { port: 3000 } },
        watchedServices: [],
      }),
    ).toThrow(/chart/);
  });
});
