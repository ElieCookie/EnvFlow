const { SunCliDriver } = require("../drivers/sun-cli.driver");

describe("ctx delete integration", () => {
  const driver = new SunCliDriver();

  beforeEach(() => {
    driver.setup("envflow-ctx-delete-");
  });

  afterEach(() => {
    driver.clearMocks();
    driver.cleanup();
  });

  test("deletes a context from the active kubectl context", () => {
    driver.createDevspaceState();
    driver.createContextFiles("dev-ci");
    driver.writeKubectl("kind-open");
    driver.writeDevspace();

    driver.execSun([
      "ctx",
      "delete",
      "--name",
      "dev-ci",
      "--cluster",
      "kind-open",
      "--yes",
    ]);

    expect(driver.fileExists("devspace-dev-ci.yaml")).toBe(false);
    expect(driver.fileExists("dev-ci.yaml")).toBe(false);
    expect(driver.fileExists("devspace-dev-ci.log")).toBe(false);
    expect(driver.devspaceStateExists()).toBe(false);
    expect(driver.readCommandLog()).toBe(
      [
        `devspace purge --config ${driver.ephemeralDir()}/devspace-dev-ci.yaml --namespace devspace-dev-ci`,
        "kubectl delete namespace devspace-dev-ci --ignore-not-found=true",
        "",
      ].join("\n"),
    );
  });

  test("does not require kubectl when no contexts exist", () => {
    driver.writeFailingKubectl();

    const result = driver.spawnSun([
      "ctx",
      "delete",
      "--name",
      "dev-ci",
      "--yes",
    ]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("No contexts found");
    expect(driver.commandLogExists()).toBe(false);
  });

  test("rejects deletion when requested cluster is not active", () => {
    driver.createContext("dev-ci");
    driver.writeKubectl("minikube");
    driver.writeDevspace();

    const result = driver.spawnSun([
      "ctx",
      "delete",
      "--name",
      "dev-ci",
      "--cluster",
      "kind-open",
      "--yes",
    ]);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("--cluster=kind-open");
    expect(driver.fileExists("devspace-dev-ci.yaml")).toBe(true);
    expect(driver.commandLogExists()).toBe(false);
  });

  test("keeps shared DevSpace state when other contexts remain", () => {
    driver.createDevspaceState();
    driver.createContextFiles("dev-ci");
    driver.createContext("dev-other");
    driver.writeKubectl("kind-open");
    driver.writeDevspace();

    driver.execSun([
      "ctx",
      "delete",
      "--name",
      "dev-ci",
      "--cluster",
      "kind-open",
      "--yes",
    ]);

    expect(driver.fileExists("devspace-dev-ci.yaml")).toBe(false);
    expect(driver.fileExists("devspace-dev-other.yaml")).toBe(true);
    expect(driver.devspaceStateExists()).toBe(true);
  });
});
