const { CtxSharedDriver } = require("../drivers/ctx-shared.driver");

describe("ctx shared helpers", () => {
  const driver = new CtxSharedDriver();

  beforeEach(() => {
    driver.setup();
  });

  afterEach(() => {
    driver.clearMocks();
    driver.cleanup();
  });

  test("parseCsvList trims and deduplicates", () => {
    expect(driver.parseCsvList("a, b,a,,c")).toEqual(["a", "b", "c"]);
  });

  test("parseCsvList returns an empty list for missing input", () => {
    expect(driver.parseCsvList()).toEqual([]);
  });

  test("parseCsvList rejects non-string values as empty input", () => {
    expect(driver.parseCsvList(["api", "web"])).toEqual([]);
  });

  test("sanitizeEnvName normalizes valid names", () => {
    expect(driver.sanitizeEnvName(" Dev-123 ")).toBe("dev-123");
  });

  test("sanitizeEnvName rejects unsupported characters", () => {
    expect(() => driver.sanitizeEnvName("Dev_123")).toThrow(
      /lowercase letters, numbers, and hyphens/,
    );
  });

  test("splitHost parses path prefixes", () => {
    expect(driver.splitHost("api.dev.example.com/payments")).toEqual({
      hostname: "api.dev.example.com",
      pathPrefix: "/payments",
    });
  });

  test("splitHost preserves root path when no prefix exists", () => {
    expect(driver.splitHost("api.dev.example.com")).toEqual({
      hostname: "api.dev.example.com",
      pathPrefix: "/",
    });
  });

  test("splitHost returns an empty result when host is missing", () => {
    expect(driver.splitHost()).toEqual({
      hostname: undefined,
      pathPrefix: undefined,
    });
  });

  test("splitHost returns an empty result when hostname is missing", () => {
    expect(driver.splitHost("/payments")).toEqual({
      hostname: undefined,
      pathPrefix: undefined,
    });
  });

  test("ensureClusterContext accepts minikube by default", () => {
    expect(driver.ensureClusterContext({ currentContext: "minikube" })).toBe(
      "minikube",
    );
  });

  test("ensureClusterContext accepts explicit current context", () => {
    expect(
      driver.ensureClusterContext({
        requestedCluster: "kind-local",
        currentContext: "kind-local",
      }),
    ).toBe("kind-local");
  });

  test("ensureClusterContext rejects missing current context", () => {
    expect(() => driver.ensureClusterContext({ currentContext: null })).toThrow(
      /kubectl has no current context/,
    );
  });

  test("ensureClusterContext rejects mismatched explicit context", () => {
    expect(() =>
      driver.ensureClusterContext({
        requestedCluster: "kind-local",
        currentContext: "minikube",
      }),
    ).toThrow(/--cluster=kind-local/);
  });

  test("buildDevspaceConfig wires deployments and watched dev blocks per service", () => {
    const cfg = driver.buildDevspaceConfig();

    expect(cfg.name).toBe("dev1");
    expect(cfg.deployments.api.helm.chart.name).toBe(driver.getChartDir());
    expect(cfg.deployments.api.helm.values.name).toBe("dev1-api");
    expect(cfg.deployments.api.helm.values.port).toBe(8080);
    expect(cfg.dev.api.ports[0].port).toBe("8080");
    expect(cfg.dev.api.sync[0].path).toBe(
      `${driver.getRepoPath()}:/usr/src/app`,
    );
    expect(cfg.dev.api.sync[0].noWatch).toBeUndefined();
  });

  test("buildDevspaceConfig marks non-watched services as passive sync targets", () => {
    const cfg = driver.buildDevspaceConfig({
      watchedServices: [],
    });

    expect(cfg.dev.api.sync[0].noWatch).toBe(true);
    expect(cfg.dev.api.sync[0].initialSync).toBe("preferLocal");
  });

  test("buildDevspaceConfig applies defaults when service values are omitted", () => {
    const cfg = driver.buildDevspaceConfig({
      servicesConfig: {
        api: {
          repoPath: driver.getRepoPath(),
          chart: driver.getChartDir(),
        },
      },
      defaults: {
        port: 3001,
        image: "node:22-alpine",
        workingDir: "/app",
        install: "npm ci",
        command: "npm start",
      },
    });

    expect(cfg.deployments.api.helm.values).toEqual({
      name: "dev1-api",
      port: 3001,
      image: "node:22-alpine",
      workingDir: "/app",
    });
    expect(cfg.dev.api.command).toEqual([
      "sh",
      "-c",
      "cd /app && npm ci && npm start",
    ]);
  });

  test("buildDevspaceConfig lets service values override defaults", () => {
    const cfg = driver.buildDevspaceConfig({
      servicesConfig: {
        api: {
          repoPath: driver.getRepoPath(),
          port: 8081,
          image: "node:20",
          workingDir: "/service",
          install: "yarn install",
          command: "yarn dev",
          chart: driver.getChartDir(),
        },
      },
      defaults: {
        port: 3001,
        image: "node:22-alpine",
        workingDir: "/app",
        install: "npm ci",
        command: "npm start",
      },
    });

    expect(cfg.deployments.api.helm.values).toEqual({
      name: "dev1-api",
      port: 8081,
      image: "node:20",
      workingDir: "/service",
    });
    expect(cfg.dev.api.command).toEqual([
      "sh",
      "-c",
      "cd /service && yarn install && yarn dev",
    ]);
  });

  test("buildDevspaceConfig merges service Helm values after generated values", () => {
    const cfg = driver.buildDevspaceConfig({
      servicesConfig: {
        api: {
          repoPath: driver.getRepoPath(),
          port: 8080,
          chart: driver.getChartDir(),
          values: {
            replicas: 2,
            image: "custom-image",
            env: {
              LOG_LEVEL: "debug",
            },
          },
        },
      },
    });

    expect(cfg.deployments.api.helm.values).toEqual({
      name: "dev1-api",
      port: 8080,
      image: "custom-image",
      workingDir: "/usr/src/app",
      replicas: 2,
      env: {
        LOG_LEVEL: "debug",
      },
    });
  });

  test("buildDevspaceConfig resolves a relative repoPath from the sunrc directory", () => {
    const cfg = driver.buildDevspaceConfig({
      servicesConfig: {
        api: {
          repoPath: "./services/api",
          chart: driver.getChartDir(),
        },
      },
      sunrcDir: driver.getTempRoot(),
    });

    expect(cfg.dev.api.sync[0].path).toBe(
      `${driver.getTempRoot()}/services/api:/usr/src/app`,
    );
  });

  test("buildDevspaceConfig resolves repo names beside the sunrc file when present", () => {
    const siblingRepo = driver.createSiblingRepo("api-repo");
    const cfg = driver.buildDevspaceConfig({
      servicesConfig: {
        api: {
          repo: "api-repo",
          chart: driver.getChartDir(),
        },
      },
      sunrcDir: driver.getTempRoot(),
    });

    expect(cfg.dev.api.sync[0].path).toBe(`${siblingRepo}:/usr/src/app`);
  });

  test("buildDevspaceConfig throws when service has no chart", () => {
    expect(() =>
      driver.buildDevspaceConfig({
        envName: "dev2",
        servicesConfig: { api: { port: 3000 } },
        watchedServices: [],
      }),
    ).toThrow(/chart/);
  });
});
