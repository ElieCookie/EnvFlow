const fs = require("fs").promises;
const path = require("path");
const yaml = require("js-yaml");

const ui = require("../../utils/ui");
const colors = require("../../utils/colors");
const paths = require("../../paths");

async function listHandler() {
  const ephemeralDir = paths.ephemeralDir();

  try {
    await fs.access(ephemeralDir);
  } catch {
    console.log(`${ui.status.warning()} No contexts found`);
    console.log(colors.dim("  Run: sun ctx create"));
    return;
  }

  const files = await fs.readdir(ephemeralDir);
  const envs = files
    .filter((file) => file.startsWith("devspace-") && file.endsWith(".yaml"))
    .map((file) => file.replace("devspace-", "").replace(".yaml", ""))
    .sort();

  if (envs.length === 0) {
    console.log(`${ui.status.warning()} No contexts found`);
    console.log(colors.dim("  Run: sun ctx create"));
    return;
  }

  console.log();
  console.log(ui.subheader("Available contexts"));

  for (const env of envs) {
    const configPath = path.join(ephemeralDir, `devspace-${env}.yaml`);
    let serviceCount = 0;
    try {
      const content = await fs.readFile(configPath, "utf8");
      const config = yaml.load(content) || {};
      serviceCount = Object.keys(config.dev || {}).length;
    } catch {
      // keep defaults
    }

    console.log(
      `  ${ui.status.bullet()} ${colors.accent(env)} ${colors.dim(`(${serviceCount} service${serviceCount === 1 ? "" : "s"})`)}`,
    );
  }

  console.log();
  console.log(
    colors.dim(
      "Use: devspace dev --config ~/.envflow-ephemeral/devspace-<name>.yaml --namespace devspace-<name>",
    ),
  );
}

module.exports = listHandler;
