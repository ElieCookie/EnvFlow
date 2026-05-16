const { CtxContextStoreDriver } = require("../drivers/ctx-context-store.driver");

describe("ctx context store", () => {
  const driver = new CtxContextStoreDriver();

  beforeEach(() => {
    driver.setup();
  });

  afterEach(() => {
    driver.clearMocks();
    driver.cleanup();
  });

  test("builds the context config path for an environment", () => {
    expect(driver.contextConfigPath("dev-a")).toBe(
      `${driver.getEphemeralDir()}/devspace-dev-a.yaml`,
    );
  });

  test("returns an empty list when the ephemeral directory is missing", async () => {
    await expect(driver.listContextNames()).resolves.toEqual([]);
  });

  test("lists context names alphabetically from devspace config files", async () => {
    driver.writeContext("web", "name: web\n");
    driver.writeContext("api", "name: api\n");
    driver.writeFile("api.yaml", "values: true\n");
    driver.writeFile("devspace-api.log", "log\n");

    await expect(driver.listContextNames()).resolves.toEqual(["api", "web"]);
  });

  test("counts services from a context devspace config", async () => {
    driver.writeContext("dev-a", "dev:\n  api: {}\n  web: {}\n");

    await expect(driver.countContextServices("dev-a")).resolves.toBe(2);
  });

  test("returns zero services for invalid context YAML", async () => {
    driver.writeContext("dev-a", "dev: [");

    await expect(driver.countContextServices("dev-a")).resolves.toBe(0);
  });

  test("returns context summaries with service counts", async () => {
    driver.writeContext("web", "dev:\n  web: {}\n");
    driver.writeContext("api", "dev:\n  api: {}\n  worker: {}\n");

    await expect(driver.listContextSummaries()).resolves.toEqual([
      { name: "api", serviceCount: 2 },
      { name: "web", serviceCount: 1 },
    ]);
  });
});
