const fs = require("fs");
const os = require("os");
const path = require("path");
const { resolveChart } = require("../../src/utils/chart-resolver");

class ChartResolverDriver {
  setup() {
    this.tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "envflow-chart-"));
    this.chartDir = path.join(this.tempRoot, "chart");
    fs.mkdirSync(this.chartDir, { recursive: true });
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

  resolveChart(chartSpec) {
    return resolveChart(chartSpec, this.tempRoot);
  }

  getChartDir() {
    return this.chartDir;
  }
}

module.exports = { ChartResolverDriver };
