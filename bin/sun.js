#!/usr/bin/env node
const { Command } = require("commander");
const packageJson = require("../package.json");
const colors = require("../src/utils/colors");

const doctorHandler = require("../src/commands/doctor");
const { riseHandler } = require("../src/commands/rise");

const program = new Command();

program
  .name("sun")
  .description("☀️  Sun CLI - Platform Infrastructure Management")
  .version(packageJson.version, "-v, --version", "display version number");

program
  .command("rise")
  .description(
    "Configure and set up the development environment (minikube by default)",
  )
  .option(
    "--with-aws",
    "also require AWS CLI (EKS-oriented; no SSO login from this command)",
  )
  .action(riseHandler);

program
  .command("doctor")
  .description("🩺  Check system health and configuration")
  .option(
    "--with-aws",
    "require AWS credentials checks (see ~/.envflow/config.json provider)",
  )
  .action(doctorHandler);

program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name() + " " + cmd.usage(),
});

program.on("--help", () => {
  console.log("");
  console.log("Examples:");
  console.log(
    "  $ sun rise                     # Tools, dirs, helm-charts symlink, optional clones - initial environment setup",
  );
  console.log(
    "  $ sun rise --with-aws          # Same plus AWS CLI (for EKS later)",
  );
  console.log(
    "  $ sun doctor                   # Minikube + kubectl + layout - checks system health",
  );
  console.log("");
  console.log(
    "For more information, visit: https://github.com/ElieCookie/EnvFlow",
  );
});

program.exitOverride();

const GRACEFUL_EXITS = new Set([
  "commander.help",
  "commander.version",
  "commander.helpDisplayed",
]);

try {
  program.parse(process.argv);

  if (process.argv.length <= 2) {
    program.help();
  }
} catch (err) {
  if (GRACEFUL_EXITS.has(err.code)) {
    process.exit(0);
  }
  console.error(colors.red("Error:"), err.message);
  process.exit(1);
}
