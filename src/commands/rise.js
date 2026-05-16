const ui = require("../utils/ui");
const colors = require("../utils/colors");
const {
  toolsForMinikube,
  toolsForAws,
  ensureToolInstalled,
  delay,
} = require("../utils/tools");
const fs = require("fs").promises;
const path = require("path");
const { execSync } = require("child_process");
const paths = require("../paths");
const { readSunrcCandidates } = require("../utils/sunrc");

function cloneUrl(org, repoName) {
  const o = org || process.env.ENVFLOW_GITHUB_ORG;
  if (!o) return null;
  if (process.env.ENVFLOW_GIT_CLONE_HTTPS === "1") {
    return `https://github.com/${o}/${repoName}.git`;
  }
  return `git@github.com:${o}/${repoName}.git`;
}

async function cloneReposFromSunrc(workspace) {
  const found = await readSunrcCandidates();
  if (!found) {
    console.log(
      `  ${ui.status.info()} No .sunrc found (skipped repo clone). Add .sunrc or copy .sunrc.example`,
    );
    return;
  }

  const { config } = found;
  const org = config.org || process.env.ENVFLOW_GITHUB_ORG;
  const services = config.services || {};
  const repos = Object.entries(services)
    .filter(([, s]) => s && s.repo)
    .map(([name, s]) => ({
      name,
      repo: s.repo,
      path: path.join(workspace, s.repo),
    }));

  if (repos.length === 0) {
    console.log(`  ${ui.status.info()} No services with repo field in .sunrc`);
    return;
  }

  if (!org) {
    console.log(
      `  ${ui.status.warning()} Set org: in .sunrc or ENVFLOW_GITHUB_ORG to clone repos`,
    );
    return;
  }

  console.log();
  console.log(ui.subheader("Cloning repositories"));
  const total = repos.length;
  for (let i = 0; i < total; i++) {
    const r = repos[i];
    const displayText = `${r.repo}                         `;
    process.stdout.write(
      `\r  ${ui.progressBar(i + 1, total, 40)}  ${displayText}`,
    );

    try {
      await fs.access(r.path);
      execSync("git pull", { cwd: r.path, stdio: "pipe" });
      await delay(100);
    } catch {
      const url = cloneUrl(org, r.repo);
      if (!url) continue;
      try {
        execSync(`git clone ${url} ${r.path}`, { stdio: "pipe" });
        await delay(100);
      } catch {
        console.log(`\n  ${ui.status.error()} clone failed: ${r.repo}`);
      }
    }
  }
  process.stdout.write(`\r${" ".repeat(60)}\r`);
  console.log(
    `  ${ui.status.success()} Repositories updated under ${workspace}`,
  );
}

async function writeProviderConfig(withAws) {
  const dir = path.dirname(paths.envflowConfigPath());
  await fs.mkdir(dir, { recursive: true });
  const body = JSON.stringify(
    {
      provider: withAws ? "aws" : "minikube",
      updatedAt: new Date().toISOString(),
    },
    null,
    2,
  );
  await fs.writeFile(paths.envflowConfigPath(), body, "utf8");
}

async function riseHandler(options) {
  const withAws = Boolean(options.withAws);
  const tools = withAws ? toolsForAws() : toolsForMinikube();

  console.log();
  console.log(ui.subheader("Checking prerequisites"));
  if (!withAws) {
    console.log(
      colors.dim(
        "  Using minikube-oriented setup (no AWS). Pass --with-aws when you target EKS.",
      ),
    );
  }

  for (const tool of tools) {
    const ok = await ensureToolInstalled(tool);
    if (!ok && tool.required) return;
  }

  console.log();
  console.log(ui.subheader("Setting up directories"));

  process.stdout.write(`  ${ui.status.pending()} Creating directory structure`);
  try {
    await fs.mkdir(paths.workspaceDir(), { recursive: true });
    await fs.mkdir(paths.ephemeralDir(), { recursive: true });
    await delay(300);
    process.stdout.write(
      `\r  ${ui.status.success()} Directory structure created                   \n`,
    );
  } catch (error) {
    process.stdout.write(
      `\r  ${ui.status.error()} Failed to create directories: ${error.message}\n`,
    );
    return;
  }

  await cloneReposFromSunrc(paths.workspaceDir());

  await writeProviderConfig(withAws);

  console.log();
  console.log(`${ui.status.success()} EnvFlow setup complete`);
  console.log(colors.dim("  Next: minikube start && sun doctor"));
}

module.exports = { riseHandler };
