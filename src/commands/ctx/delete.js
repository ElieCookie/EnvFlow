const inquirer = require("inquirer");
const { execFileSync } = require("child_process");

const ui = require("../../utils/ui");
const colors = require("../../utils/colors");
const paths = require("../../paths");
const { ensureClusterContext } = require("./shared");
const { contextConfigPath, listContextNames } = require("./context-store");
const {
  resolveDeleteEnvName,
  removeLocalFiles,
  removeDevspaceStateWhenUnused,
} = require("./delete-helpers");

async function deleteHandler(options = {}) {
  try {
    const envs = await listContextNames();

    if (envs.length === 0) {
      console.log(`${ui.status.warning()} No contexts found`);
      console.log(colors.dim("  Run: sun ctx create"));
      return;
    }

    const cluster = ensureContext(options.cluster);
    const envName = await resolveEnvName({
      requestedName: options.name,
      envs,
    });
    const confirmed = await confirmDelete({
      envName,
      skipPrompt: Boolean(options.yes),
    });

    if (!confirmed) {
      console.log(`${ui.status.warning()} Deletion cancelled`);
      return;
    }

    const ephemeralDir = paths.ephemeralDir();
    const namespace = `devspace-${envName}`;
    const devspaceConfigPath = contextConfigPath(envName, ephemeralDir);

    console.log();
    console.log(ui.subheader("Deleting context"));
    console.log(`  ${ui.status.info()} Environment: ${colors.accent(envName)}`);
    console.log(`  ${ui.status.info()} Cluster: ${colors.accent(cluster)}`);

    await purgeDevspace({ devspaceConfigPath, namespace, cwd: ephemeralDir });
    await deleteNamespace(namespace);
    await removeLocalFiles({ ephemeralDir, envName });
    console.log(`  ${ui.status.success()} Local context files removed`);
    await removeDevspaceStateWhenUnused(ephemeralDir);

    console.log();
    console.log(`${ui.status.success()} Context "${envName}" deleted`);
  } catch (error) {
    console.log();
    console.log(`${ui.status.error()} ${error.message}`);
    process.exit(1);
  }
}

function ensureContext(requestedCluster) {
  try {
    return ensureClusterContext({ requestedCluster });
  } catch (error) {
    throw new Error(error.message);
  }
}

async function resolveEnvName({ requestedName, envs }) {
  if (requestedName) {
    return resolveDeleteEnvName({ requestedName, envs });
  }

  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "envName",
      message: "Select context to delete:",
      choices: envs,
    },
  ]);
  return answer.envName;
}

async function confirmDelete({ envName, skipPrompt }) {
  if (skipPrompt) return true;

  const answer = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmed",
      message: `Delete context "${envName}" and namespace "devspace-${envName}"?`,
      default: false,
    },
  ]);
  return answer.confirmed;
}

async function purgeDevspace({ devspaceConfigPath, namespace, cwd }) {
  console.log(`  ${ui.status.pending()} Purging DevSpace resources`);
  try {
    execFileSync(
      "devspace",
      ["purge", "--config", devspaceConfigPath, "--namespace", namespace],
      {
        cwd,
        stdio: "pipe",
        timeout: 30000,
      },
    );
    console.log(`  ${ui.status.success()} DevSpace resources purged`);
  } catch {
    console.log(
      `  ${ui.status.warning()} DevSpace purge skipped or failed; continuing with namespace cleanup`,
    );
  }
}

async function deleteNamespace(namespace) {
  console.log(`  ${ui.status.pending()} Deleting namespace ${namespace}`);
  execFileSync(
    "kubectl",
    ["delete", "namespace", namespace, "--ignore-not-found=true"],
    {
      stdio: "pipe",
      timeout: 60000,
    },
  );
  console.log(`  ${ui.status.success()} Namespace delete requested`);
}

module.exports = deleteHandler;
