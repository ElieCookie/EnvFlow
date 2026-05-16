const ui = require("../../utils/ui");
const colors = require("../../utils/colors");
const { listContextSummaries } = require("./context-store");

async function listHandler() {
  const contexts = await listContextSummaries();

  if (contexts.length === 0) {
    console.log(`${ui.status.warning()} No contexts found`);
    console.log(colors.dim("  Run: sun ctx create"));
    return;
  }

  console.log();
  console.log(ui.subheader("Available contexts"));

  for (const { name, serviceCount } of contexts) {
    console.log(
      `  ${ui.status.bullet()} ${colors.accent(name)} ${colors.dim(`(${serviceCount} service${serviceCount === 1 ? "" : "s"})`)}`,
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
