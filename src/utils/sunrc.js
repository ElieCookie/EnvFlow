const fs = require("fs").promises;
const path = require("path");
const os = require("os");
const yaml = require("js-yaml");
const paths = require("../paths");

function sunrcCandidates() {
  return [
    path.join(process.cwd(), ".sunrc"),
    path.join(paths.REPO_ROOT, ".sunrc"),
    path.join(os.homedir(), "envflow", "sun-cli", ".sunrc"),
  ];
}

async function readSunrcCandidates() {
  for (const candidate of sunrcCandidates()) {
    try {
      const raw = await fs.readFile(candidate, "utf8");
      return { path: candidate, config: yaml.load(raw) || {} };
    } catch {
      // try next candidate
    }
  }
  return null;
}

module.exports = { sunrcCandidates, readSunrcCandidates };
