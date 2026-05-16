const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { execSync } = require("child_process");
const paths = require("../paths");

function chartCacheDir() {
  return path.join(paths.ephemeralDir(), "chart-cache");
}

function resolveGitChart({ git, path: subpath, ref }) {
  const cacheRoot = chartCacheDir();
  const key = crypto
    .createHash("sha1")
    .update(`${git}@${ref || "HEAD"}`)
    .digest("hex")
    .slice(0, 12);
  const cloneDir = path.join(cacheRoot, key);

  if (!fs.existsSync(cloneDir)) {
    fs.mkdirSync(cacheRoot, { recursive: true });
    const branchArg = ref ? `--branch ${ref} --single-branch` : "";
    execSync(`git clone --depth 1 ${branchArg} ${git} ${cloneDir}`, {
      stdio: "pipe",
    });
  }

  const resolved = subpath ? path.join(cloneDir, subpath) : cloneDir;
  if (!fs.existsSync(resolved)) {
    throw new Error(`Chart subpath not found in cloned repo: ${resolved}`);
  }
  return resolved;
}

function isGitUrl(s) {
  return (
    /^(git@|https?:\/\/|ssh:\/\/)/.test(s) ||
    s.endsWith(".git") ||
    s.startsWith("github.com")
  );
}

function resolveChart(chartSpec, cwd = process.cwd()) {
  if (!chartSpec) {
    throw new Error(
      "Service is missing `chart:` in .sunrc. Set a local path, a git URL, or { git, path, ref }.",
    );
  }

  if (typeof chartSpec === "string") {
    if (isGitUrl(chartSpec)) {
      return resolveGitChart({ git: chartSpec });
    }
    const abs = path.isAbsolute(chartSpec)
      ? chartSpec
      : path.resolve(cwd, chartSpec);
    if (!fs.existsSync(abs)) {
      throw new Error(`Chart path not found: ${abs}`);
    }
    return abs;
  }

  if (chartSpec && typeof chartSpec === "object" && chartSpec.git) {
    return resolveGitChart(chartSpec);
  }

  throw new Error(`Invalid chart spec: ${JSON.stringify(chartSpec)}`);
}

module.exports = { resolveChart, chartCacheDir };
