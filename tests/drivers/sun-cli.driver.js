const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");
const yaml = require("js-yaml");

class SunCliDriver {
  setup(prefix = "envflow-cli-") {
    this.tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
    this.homeDir = path.join(this.tempRoot, "home");
    this.binDir = path.join(this.tempRoot, "bin");
    this.projectDir = path.join(this.tempRoot, "project");
    this.commandLog = path.join(this.tempRoot, "commands.log");
    fs.mkdirSync(this.homeDir, { recursive: true });
    fs.mkdirSync(this.binDir, { recursive: true });
  }

  clearMocks() {
    jest.clearAllMocks();
  }

  cleanup() {
    fs.rmSync(this.tempRoot, { recursive: true, force: true });
  }

  createProjectWithSunrc(sunrc) {
    fs.mkdirSync(this.projectDir, { recursive: true });
    const chartDir = path.join(this.projectDir, "chart");
    fs.mkdirSync(chartDir, { recursive: true });
    fs.writeFileSync(
      path.join(chartDir, "Chart.yaml"),
      "apiVersion: v2\nname: stub\nversion: 0.0.1\n",
    );
    fs.writeFileSync(path.join(this.projectDir, ".sunrc"), sunrc);
  }

  writeKubectl(context) {
    fs.writeFileSync(
      path.join(this.binDir, "kubectl"),
      `#!/bin/sh
if [ "$1 $2" = "config current-context" ]; then
  echo ${context}
  exit 0
fi
echo "kubectl $*" >> "${this.commandLog}"
exit 0
`,
      { mode: 0o755 },
    );
  }

  writeFailingKubectl() {
    fs.writeFileSync(
      path.join(this.binDir, "kubectl"),
      `#!/bin/sh
echo "kubectl $*" >> "${this.commandLog}"
exit 2
`,
      { mode: 0o755 },
    );
  }

  writeDevspace() {
    fs.writeFileSync(
      path.join(this.binDir, "devspace"),
      `#!/bin/sh
echo "devspace $*" >> "${this.commandLog}"
exit 0
`,
      { mode: 0o755 },
    );
  }

  createContext(envName) {
    fs.mkdirSync(this.ephemeralDir(), { recursive: true });
    fs.writeFileSync(
      path.join(this.ephemeralDir(), `devspace-${envName}.yaml`),
      `name: ${envName}\n`,
    );
  }

  createContextFiles(envName) {
    this.createContext(envName);
    fs.writeFileSync(
      path.join(this.ephemeralDir(), `${envName}.yaml`),
      "values\n",
    );
    fs.writeFileSync(
      path.join(this.ephemeralDir(), `devspace-${envName}.log`),
      "log\n",
    );
  }

  createDevspaceState() {
    fs.mkdirSync(this.devspaceStateDir(), { recursive: true });
  }

  execSun(args, cwd = this.tempRoot) {
    return execFileSync(process.execPath, [this.cliPath(), ...args], {
      cwd,
      env: this.env(),
      stdio: "pipe",
      encoding: "utf8",
    });
  }

  spawnSun(args, cwd = this.tempRoot) {
    return spawnSync(process.execPath, [this.cliPath(), ...args], {
      cwd,
      env: this.env(),
      encoding: "utf8",
    });
  }

  readDevspaceConfig(envName) {
    return yaml.load(
      fs.readFileSync(
        path.join(this.ephemeralDir(), `devspace-${envName}.yaml`),
        "utf8",
      ),
    );
  }

  fileExists(relativePath) {
    return fs.existsSync(path.join(this.ephemeralDir(), relativePath));
  }

  commandLogExists() {
    return fs.existsSync(this.commandLog);
  }

  devspaceStateExists() {
    return fs.existsSync(this.devspaceStateDir());
  }

  readCommandLog() {
    return fs.readFileSync(this.commandLog, "utf8");
  }

  ephemeralDir() {
    return path.join(this.homeDir, ".envflow-ephemeral");
  }

  devspaceStateDir() {
    return path.join(this.ephemeralDir(), ".devspace");
  }

  cliPath() {
    return path.join(__dirname, "..", "..", "bin", "sun.js");
  }

  env() {
    return {
      ...process.env,
      HOME: this.homeDir,
      PATH: `${this.binDir}:${process.env.PATH}`,
    };
  }

  getProjectDir() {
    return this.projectDir;
  }
}

module.exports = { SunCliDriver };
