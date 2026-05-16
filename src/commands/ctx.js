const { Command } = require("commander");

const listHandler = require("./ctx/list");
const createHandler = require("./ctx/create");

const ctxCommand = new Command("ctx").description(
  "🗂️  Manage environment contexts",
);

ctxCommand
  .command("ls")
  .description("List available environment contexts")
  .action(listHandler);

ctxCommand
  .command("create")
  .description("Create a new environment context from .sunrc")
  .option("-n, --name <name>", "environment name")
  .option("-w, --watch <services>", "comma-separated watched services")
  .option("-s, --services <services>", "comma-separated deployed services")
  .option("-c, --cluster <name>", "kubectl context to target (default minikube)")
  .option("--no-deploy", "write config only; skip devspace dev")
  .option("-y, --yes", "non-interactive; watch all deployed services")
  .action(createHandler);

module.exports = ctxCommand;
