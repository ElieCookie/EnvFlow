const path = require("path");
const fs = require("fs").promises;
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);
const colors = require("../utils/colors");
const ui = require("../utils/ui");
const {
  toolsForMinikube,
  toolsForAws,
  checkToolExists,
} = require("../utils/tools");
const paths = require("../paths");

async function loadDoctorMode(options) {
  if (options.withAws) return "aws";
  try {
    const raw = await fs.readFile(paths.envflowConfigPath(), "utf8");
    const j = JSON.parse(raw);
    if (j.provider === "aws") return "aws";
  } catch {
    /* default */
  }
  return "minikube";
}

async function doctorHandler(options) {
  try {
    const mode = await loadDoctorMode(options);
    const tools = mode === "aws" ? toolsForAws() : toolsForMinikube();
    const issues = [];
    const toolFound = {};

    console.log();
    console.log(ui.subheader("Required tools"));
    for (const tool of tools) {
      const found = await checkToolExists(tool);
      toolFound[tool.name] = found;
      if (!found) {
        const fix = tool.install ? tool.install : `Install ${tool.name}`;
        issues.push(`${tool.name}: ${fix}`);
      }
    }

    if (mode === "aws") {
      console.log();
      console.log(ui.subheader("AWS"));
      process.stdout.write(`  ${ui.status.pending()} Checking AWS credentials`);
      try {
        await execAsync("aws sts get-caller-identity", { timeout: 8000 });
        process.stdout.write(
          `\r  ${ui.status.success()} AWS credentials OK                         \n`,
        );
      } catch {
        process.stdout.write(
          `\r  ${ui.status.error()} AWS not authenticated                      \n`,
        );
        issues.push("Run: aws sso login (or export credentials) then retry");
      }
    } else if (toolFound.minikube) {
      console.log();
      console.log(ui.subheader("Cluster (minikube)"));
      process.stdout.write(`  ${ui.status.pending()} Checking minikube`);
      try {
        const { stdout } = await execAsync("minikube status", {
          timeout: 8000,
        });
        if (/Running|running/.test(stdout)) {
          process.stdout.write(
            `\r  ${ui.status.success()} minikube reports running                 \n`,
          );
        } else {
          process.stdout.write(
            `\r  ${ui.status.warning()} minikube not fully running               \n`,
          );
          issues.push("Start minikube: minikube start");
        }
      } catch {
        process.stdout.write(
          `\r  ${ui.status.warning()} minikube status unavailable              \n`,
        );
        issues.push("Start minikube: minikube start");
      }
    }

    if (mode !== "aws" && toolFound.kubectl) {
      if (!toolFound.minikube) {
        console.log();
        console.log(ui.subheader("Cluster (kubectl)"));
      }
      process.stdout.write(`  ${ui.status.pending()} Checking kubectl cluster`);
      try {
        await execAsync("kubectl cluster-info --request-timeout=8s", {
          timeout: 10000,
        });
        process.stdout.write(
          `\r  ${ui.status.success()} kubectl can reach the cluster             \n`,
        );
      } catch {
        process.stdout.write(
          `\r  ${ui.status.error()} kubectl cannot reach a cluster              \n`,
        );
        issues.push("Point kubectl at your cluster (e.g. minikube start)");
      }
    }

    console.log();
    console.log(ui.subheader("Directory layout"));
    await checkDirectories(issues);

    console.log();
    printResults(issues, mode);
  } catch (error) {
    console.log();
    console.log(`${ui.status.error()} Doctor check failed: ${error.message}`);
    process.exit(1);
  }
}

async function checkDirectories(issues) {
  const ephemeralDir = paths.ephemeralDir();
  const helmEphemeral = paths.helmChartsEphemeralPath();
  const helmRepo = paths.helmChartsRepoPath();

  process.stdout.write(
    `  ${ui.status.pending()} Checking ~/.envflow-ephemeral`,
  );
  const ephemeralOk = await fs.access(ephemeralDir).then(
    () => true,
    () => false,
  );
  if (!ephemeralOk) {
    process.stdout.write(
      `\r  ${ui.status.error()} ~/.envflow-ephemeral missing                  \n`,
    );
    issues.push(`Create layout: sun rise`);
    return;
  }
  process.stdout.write(
    `\r  ${ui.status.success()} ~/.envflow-ephemeral exists                   \n`,
  );

  process.stdout.write(`  ${ui.status.pending()} Checking helm-charts`);
  let helmOk = false;
  try {
    await fs.access(helmEphemeral);
    helmOk = true;
  } catch {
    /* missing */
  }
  if (!helmOk) {
    process.stdout.write(
      `\r  ${ui.status.error()} helm-charts path missing                     \n`,
    );
    issues.push(
      `Link charts: sun rise (symlinks repo helm-charts → ~/.envflow-ephemeral/helm-charts)`,
    );
    return;
  }

  try {
    const st = await fs.lstat(helmEphemeral);
    if (st.isSymbolicLink()) {
      const target = await fs.readlink(helmEphemeral);
      const resolved = path.resolve(path.dirname(helmEphemeral), target);
      if (resolved === path.resolve(helmRepo)) {
        process.stdout.write(
          `\r  ${ui.status.success()} helm-charts → EnvFlow repo                \n`,
        );
      } else {
        process.stdout.write(
          `\r  ${ui.status.warning()} helm-charts symlink unexpected target    \n`,
        );
        issues.push(`Expected symlink to ${helmRepo}; run sun rise to fix`);
      }
    } else {
      process.stdout.write(
        `\r  ${ui.status.info()} helm-charts is a plain directory (OK)        \n`,
      );
    }
  } catch {
    process.stdout.write(
      `\r  ${ui.status.warning()} could not stat helm-charts                  \n`,
    );
  }

  const files = await fs.readdir(ephemeralDir);
  const envFiles = files.filter(
    (f) => f.startsWith("devspace-") && f.endsWith(".yaml"),
  );
  if (envFiles.length === 0) return;

  const envNames = envFiles
    .map((f) => f.replace("devspace-", "").replace(".yaml", ""))
    .join(", ");
  console.log(
    `  ${ui.status.info()} ${envFiles.length} environment(s): ${colors.dim(envNames)}`,
  );
}

function printResults(issues, mode) {
  if (issues.length === 0) {
    console.log(`${ui.status.success()} All checks passed`);
    console.log(colors.dim("  EnvFlow CLI is ready"));
    return;
  }

  console.log(`${ui.status.error()} Issues found (${issues.length})`);
  console.log();
  issues.forEach((issue) =>
    console.log(`  ${ui.status.bullet()} ${colors.text(issue)}`),
  );
  console.log();
  const hint =
    mode === "aws"
      ? `${colors.accent("sun rise --with-aws")}`
      : `${colors.accent("sun rise")} or ${colors.accent("minikube start")}`;
  console.log(`${ui.status.info()} Quick fix: ${hint}`);
  process.exit(1);
}

module.exports = doctorHandler;
