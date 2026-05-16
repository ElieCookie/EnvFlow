const { CtxDeleteHelpersDriver } = require("../drivers/ctx-delete-helpers.driver");

describe("ctx delete helpers", () => {
  const driver = new CtxDeleteHelpersDriver();

  beforeEach(() => {
    driver.setup();
  });

  afterEach(() => {
    driver.clearMocks();
    driver.cleanup();
  });

  test("resolves a requested environment name when it exists", () => {
    expect(
      driver.resolveDeleteEnvName({
        requestedName: " Dev-A ",
        envs: ["dev-a", "dev-b"],
      }),
    ).toBe("dev-a");
  });

  test("returns null when no environment name was requested", () => {
    expect(
      driver.resolveDeleteEnvName({
        requestedName: undefined,
        envs: ["dev-a"],
      }),
    ).toBe(null);
  });

  test("rejects a requested environment that does not exist", () => {
    expect(() =>
      driver.resolveDeleteEnvName({
        requestedName: "dev-c",
        envs: ["dev-a", "dev-b"],
      }),
    ).toThrow(/Context "dev-c" was not found/);
  });

  test("returns all local files owned by a context", () => {
    expect(driver.localContextFiles("dev-a")).toEqual([
      `${driver.getEphemeralDir()}/devspace-dev-a.yaml`,
      `${driver.getEphemeralDir()}/dev-a.yaml`,
      `${driver.getEphemeralDir()}/devspace-dev-a.log`,
      `${driver.getEphemeralDir()}/.devspace-dev-a.log`,
    ]);
  });

  test("removes generated local files for a context", async () => {
    driver.writeContextFiles("dev-a");

    await driver.removeLocalFiles("dev-a");

    expect(driver.fileExists("devspace-dev-a.yaml")).toBe(false);
    expect(driver.fileExists("dev-a.yaml")).toBe(false);
    expect(driver.fileExists("devspace-dev-a.log")).toBe(false);
    expect(driver.fileExists(".devspace-dev-a.log")).toBe(false);
  });

  test("removes shared DevSpace state when no contexts remain", async () => {
    driver.writeDevspaceState();

    await expect(driver.removeDevspaceStateWhenUnused()).resolves.toBe(true);
    expect(driver.devspaceStateExists()).toBe(false);
  });

  test("keeps shared DevSpace state when contexts remain", async () => {
    driver.writeDevspaceState();
    driver.writeContextConfig("dev-b");

    await expect(driver.removeDevspaceStateWhenUnused()).resolves.toBe(false);
    expect(driver.devspaceStateExists()).toBe(true);
  });
});
