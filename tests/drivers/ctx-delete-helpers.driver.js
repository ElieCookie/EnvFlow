const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  resolveDeleteEnvName,
  localContextFiles,
  removeLocalFiles,
  removeDevspaceStateWhenUnused,
} = require("../../src/commands/ctx/delete-helpers");

class CtxDeleteHelpersDriver {
  setup() {
    this.tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "envflow-delete-"));
    this.ephemeralDir = path.join(this.tempRoot, ".envflow-ephemeral");
    fs.mkdirSync(this.ephemeralDir, { recursive: true });
  }

  clearMocks() {
    jest.clearAllMocks();
  }

  cleanup() {
    fs.rmSync(this.tempRoot, { recursive: true, force: true });
  }

  resolveDeleteEnvName(input) {
    return resolveDeleteEnvName(input);
  }

  localContextFiles(envName) {
    return localContextFiles({ ephemeralDir: this.ephemeralDir, envName });
  }

  writeContextFiles(envName) {
    fs.writeFileSync(
      path.join(this.ephemeralDir, `devspace-${envName}.yaml`),
      "name: test\n",
    );
    fs.writeFileSync(
      path.join(this.ephemeralDir, `${envName}.yaml`),
      "values\n",
    );
    fs.writeFileSync(
      path.join(this.ephemeralDir, `devspace-${envName}.log`),
      "log\n",
    );
    fs.writeFileSync(
      path.join(this.ephemeralDir, `.devspace-${envName}.log`),
      "log\n",
    );
  }

  writeContextConfig(envName) {
    fs.writeFileSync(
      path.join(this.ephemeralDir, `devspace-${envName}.yaml`),
      "name: test\n",
    );
  }

  writeDevspaceState() {
    fs.mkdirSync(this.devspaceStateDir(), { recursive: true });
  }

  removeLocalFiles(envName) {
    return removeLocalFiles({ ephemeralDir: this.ephemeralDir, envName });
  }

  removeDevspaceStateWhenUnused() {
    return removeDevspaceStateWhenUnused(this.ephemeralDir);
  }

  fileExists(name) {
    return fs.existsSync(path.join(this.ephemeralDir, name));
  }

  devspaceStateExists() {
    return fs.existsSync(this.devspaceStateDir());
  }

  devspaceStateDir() {
    return path.join(this.ephemeralDir, ".devspace");
  }

  getEphemeralDir() {
    return this.ephemeralDir;
  }
}

module.exports = { CtxDeleteHelpersDriver };
