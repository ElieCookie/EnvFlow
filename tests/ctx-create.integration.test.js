const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const yaml = require("js-yaml");

describe("ctx create integration", () => {
  let tempRoot;

  afterEach(() => {
    if (tempRoot) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
      tempRoot = null;
    }
  });

  test("writes devspace yaml through CLI command", () => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "envflow-ctx-create-"));
    const tempHome = path.join(tempRoot, "home");
    const tempProject = path.join(tempRoot, "project");
    fs.mkdirSync(tempHome, { recursive: true });
    fs.mkdirSync(tempProject, { recursive: true });

    const chartDir = path.join(tempProject, "chart");
    fs.mkdirSync(chartDir, { recursive: true });
    fs.writeFileSync(
      path.join(chartDir, "Chart.yaml"),
      "apiVersion: v2\nname: stub\nversion: 0.0.1\n",
    );

    const sunrc = `services:
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
`;
    fs.writeFileSync(path.join(tempProject, ".sunrc"), sunrc);

    const cliPath = path.join(__dirname, "..", "bin", "sun.js");
    const fakeKubectl = path.join(tempRoot, "bin");
    fs.mkdirSync(fakeKubectl, { recursive: true });
    fs.writeFileSync(
      path.join(fakeKubectl, "kubectl"),
      "#!/bin/sh\necho minikube\n",
      { mode: 0o755 },
    );

    execFileSync(
      process.execPath,
      [cliPath, "ctx", "create", "--name", "dev-ci", "--yes", "--no-deploy"],
      {
        cwd: tempProject,
        env: {
          ...process.env,
          HOME: tempHome,
          PATH: `${fakeKubectl}:${process.env.PATH}`,
        },
        stdio: "pipe",
        encoding: "utf8",
      },
    );

    const ephemeral = path.join(tempHome, ".envflow-ephemeral");
    const devspacePath = path.join(ephemeral, "devspace-dev-ci.yaml");

    expect(fs.existsSync(devspacePath)).toBe(true);

    const devspace = yaml.load(fs.readFileSync(devspacePath, "utf8"));
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
