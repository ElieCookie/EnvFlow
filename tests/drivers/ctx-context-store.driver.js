const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  contextConfigPath,
  listContextNames,
  countContextServices,
  listContextSummaries,
} = require("../../src/commands/ctx/context-store");

class CtxContextStoreDriver {
  setup() {
    this.tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "envflow-context-"));
    this.ephemeralDir = path.join(this.tempRoot, ".envflow-ephemeral");
  }

  clearMocks() {
    jest.clearAllMocks();
  }

  cleanup() {
    fs.rmSync(this.tempRoot, { recursive: true, force: true });
  }

  createEphemeralDir() {
    fs.mkdirSync(this.ephemeralDir, { recursive: true });
  }

  writeContext(name, content) {
    this.createEphemeralDir();
    fs.writeFileSync(contextConfigPath(name, this.ephemeralDir), content);
  }

  writeFile(name, content) {
    this.createEphemeralDir();
    fs.writeFileSync(path.join(this.ephemeralDir, name), content);
  }

  contextConfigPath(name) {
    return contextConfigPath(name, this.ephemeralDir);
  }

  listContextNames() {
    return listContextNames({ ephemeralDir: this.ephemeralDir });
  }

  countContextServices(name) {
    return countContextServices(name, { ephemeralDir: this.ephemeralDir });
  }

  listContextSummaries() {
    return listContextSummaries({ ephemeralDir: this.ephemeralDir });
  }

  getEphemeralDir() {
    return this.ephemeralDir;
  }
}

module.exports = { CtxContextStoreDriver };
