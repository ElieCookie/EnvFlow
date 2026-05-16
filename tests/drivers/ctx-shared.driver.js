const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  ensureClusterContext,
  parseCsvList,
  sanitizeEnvName,
  splitHost,
  buildDevspaceConfig,
} = require("../../src/commands/ctx/shared");

class CtxSharedDriver {
  setup() {
    this.tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "envflow-shared-"));
    this.chartDir = path.join(this.tempRoot, "chart");
    this.repoPath = path.join(this.tempRoot, "api");
    fs.mkdirSync(this.chartDir, { recursive: true });
    fs.mkdirSync(this.repoPath, { recursive: true });
    fs.writeFileSync(
      path.join(this.chartDir, "Chart.yaml"),
      "apiVersion: v2\nname: stub\nversion: 0.0.1\n",
    );
  }

  clearMocks() {
    jest.clearAllMocks();
  }

  cleanup() {
    fs.rmSync(this.tempRoot, { recursive: true, force: true });
  }

  parseCsvList(value) {
    return parseCsvList(value);
  }

  sanitizeEnvName(value) {
    return sanitizeEnvName(value);
  }

  splitHost(value) {
    return splitHost(value);
  }

  ensureClusterContext(input) {
    return ensureClusterContext(input);
  }

  buildDevspaceConfig(input = {}) {
    return buildDevspaceConfig({
      envName: "dev1",
      servicesConfig: {
        api: {
          repoPath: this.repoPath,
          port: 8080,
          command: "npm run dev",
          chart: this.chartDir,
        },
      },
      watchedServices: ["api"],
      ...input,
    });
  }

  createSiblingRepo(name) {
    const repoPath = path.join(this.tempRoot, name);
    fs.mkdirSync(repoPath, { recursive: true });
    return repoPath;
  }

  getChartDir() {
    return this.chartDir;
  }

  getRepoPath() {
    return this.repoPath;
  }

  getTempRoot() {
    return this.tempRoot;
  }
}

module.exports = { CtxSharedDriver };
