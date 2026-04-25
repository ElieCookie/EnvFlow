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

  test("creates devspace and values yaml through CLI command", () => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "envflow-ctx-create-"));
    const tempHome = path.join(tempRoot, "home");
    const tempProject = path.join(tempRoot, "project");
    fs.mkdirSync(tempHome, { recursive: true });
    fs.mkdirSync(tempProject, { recursive: true });

    const sunrc = `services:
  api:
    repo: api-repo
    port: 8080
    host: api.dev.example.com/v1
    command: npm run dev
  web:
    repo: web-repo
    port: 3000
    host: web.dev.example.com
    command: npm run start
`;
    fs.writeFileSync(path.join(tempProject, ".sunrc"), sunrc);

    const cliPath = path.join(__dirname, "..", "bin", "sun.js");
    execFileSync(process.execPath, [cliPath, "ctx", "create", "--name", "dev-ci", "--yes"], {
      cwd: tempProject,
      env: { ...process.env, HOME: tempHome },
      stdio: "pipe",
      encoding: "utf8",
    });

    const ephemeral = path.join(tempHome, ".envflow-ephemeral");
    const devspacePath = path.join(ephemeral, "devspace-dev-ci.yaml");
    const valuesPath = path.join(ephemeral, "dev-ci.yaml");

    expect(fs.existsSync(devspacePath)).toBe(true);
    expect(fs.existsSync(valuesPath)).toBe(true);

    const devspace = yaml.load(fs.readFileSync(devspacePath, "utf8"));
    const values = yaml.load(fs.readFileSync(valuesPath, "utf8"));

    expect(devspace.name).toBe("dev-ci");
    expect(Object.keys(devspace.dev || {}).sort()).toEqual(["api", "web"]);

    expect(values.environmentName).toBe("dev-ci");
    expect(values.services).toHaveLength(2);
    expect(values.services.map((s) => s.name).sort()).toEqual(["dev-ci-api", "dev-ci-web"]);
  });
});
