const { SunCliDriver } = require("../drivers/sun-cli.driver");

describe("ctx create integration", () => {
  const driver = new SunCliDriver();

  beforeEach(() => {
    driver.setup("envflow-ctx-create-");
  });

  afterEach(() => {
    driver.clearMocks();
    driver.cleanup();
  });

  test("writes devspace yaml through CLI command", () => {
    driver.createProjectWithSunrc(`services:
  api:
    repo: api-repo
    port: 8080
    command: npm run dev
    chart: ./chart
  web:
    repo: web-repo
    port: 3000
    command: npm run start
    chart: ./chart
`);
    driver.writeKubectl("minikube");

    driver.execSun(
      ["ctx", "create", "--name", "dev-ci", "--yes", "--no-deploy"],
      driver.getProjectDir(),
    );

    const devspace = driver.readDevspaceConfig("dev-ci");
    expect(devspace.name).toBe("dev-ci");
    expect(Object.keys(devspace.dev || {}).sort()).toEqual(["api", "web"]);
    expect(Object.keys(devspace.deployments || {}).sort()).toEqual([
      "api",
      "web",
    ]);
    expect(devspace.deployments.api.helm.values.name).toBe("dev-ci-api");
    expect(devspace.deployments.api.helm.values.port).toBe(8080);
  });
});
