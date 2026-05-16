const { ChartResolverDriver } = require("../drivers/chart-resolver.driver");

describe("chart resolver", () => {
  const driver = new ChartResolverDriver();

  beforeEach(() => {
    driver.setup();
  });

  afterEach(() => {
    driver.clearMocks();
    driver.cleanup();
  });

  test("resolves a relative local chart path", () => {
    expect(driver.resolveChart("./chart")).toBe(driver.getChartDir());
  });

  test("resolves an absolute local chart path", () => {
    expect(driver.resolveChart(driver.getChartDir())).toBe(driver.getChartDir());
  });

  test("rejects a missing local chart path", () => {
    expect(() => driver.resolveChart("./missing")).toThrow(
      /Chart path not found/,
    );
  });

  test("rejects a missing chart spec", () => {
    expect(() => driver.resolveChart(undefined)).toThrow(
      /Service is missing `chart:`/,
    );
  });

  test("rejects an invalid chart spec", () => {
    expect(() => driver.resolveChart({ path: "chart" })).toThrow(
      /Invalid chart spec/,
    );
  });
});
