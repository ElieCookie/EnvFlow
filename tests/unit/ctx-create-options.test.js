const {
  CtxCreateOptionsDriver,
} = require("../drivers/ctx-create-options.driver");

describe("ctx create options", () => {
  const driver = new CtxCreateOptionsDriver();

  beforeEach(() => {
    driver.setup();
  });

  afterEach(() => {
    driver.clearMocks();
  });

  test("deploys every service when no services option is provided", () => {
    expect(
      driver.resolveDeployedServiceNames({
        serviceNames: ["api", "web", "worker"],
      }),
    ).toEqual(["api", "web", "worker"]);
  });

  test("deploys only services selected by the services option", () => {
    expect(
      driver.resolveDeployedServiceNames({
        serviceNames: ["api", "web", "worker"],
        servicesOption: "worker,api",
      }),
    ).toEqual(["api", "worker"]);
  });

  test("returns an empty deployed service list when selected services do not exist", () => {
    expect(
      driver.resolveDeployedServiceNames({
        serviceNames: ["api", "web"],
        servicesOption: "missing",
      }),
    ).toEqual([]);
  });

  test("watches every deployed service in yes mode", () => {
    expect(
      driver.resolveDefaultWatchedServices({
        deployedServiceNames: ["api", "web"],
        yes: true,
      }),
    ).toEqual(["api", "web"]);
  });

  test("watches only deployed services selected by the watch option", () => {
    expect(
      driver.resolveDefaultWatchedServices({
        deployedServiceNames: ["api", "web"],
        watchOption: "worker,web",
        yes: true,
      }),
    ).toEqual(["web"]);
  });

  test("does not preselect watched services in interactive mode", () => {
    expect(
      driver.resolveDefaultWatchedServices({
        deployedServiceNames: ["api", "web"],
        yes: false,
      }),
    ).toEqual([]);
  });
});
