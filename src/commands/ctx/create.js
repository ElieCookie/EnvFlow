const fs = require("fs").promises;
const path = require("path");
const yaml = require("js-yaml");
const inquirer = require("inquirer");
const { spawn } = require("child_process");

const ui = require("../../utils/ui");
const colors = require("../../utils/colors");
const paths = require("../../paths");
const { readSunrcCandidates } = require("../../utils/sunrc");
const {
  ensureClusterContext,
  sanitizeEnvName,
  buildDevspaceConfig,
} = require("./shared");
const {
  resolveDeployedServiceNames,
  resolveDefaultWatchedServices,
} = require("./create-options");

async function promptMissingInputs({ envName, watchedServices, serviceNames }) {
  let finalEnvName = envName;
  let finalWatched = watchedServices;

  if (!finalWatched || finalWatched.length === 0) {
    const answer = await inquirer.prompt([
      {
        type: "checkbox",
        name: "watched",
        message: "Select services to actively watch for changes:",
        choices: serviceNames,
        validate: (value) =>
          value.length > 0 ? true : "Select at least one service",
      },
    ]);
    finalWatched = answer.watched;
  }

  if (!finalEnvName) {
    const answer = await inquirer.prompt([
      {
        type: "input",
        name: "envName",
        message: "Enter environment name:",
        validate: (value) => {
          try {
            sanitizeEnvName(value);
            return true;
          } catch (error) {
            return error.message;
          }
        },
      },
    ]);
    finalEnvName = answer.envName;
  }

  return {
    envName: sanitizeEnvName(finalEnvName),
    watchedServices: finalWatched,
  };
}

function spawnDevspaceDev({ configPath, namespace }) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "devspace",
      ["dev", "--config", configPath, "--namespace", namespace],
      { stdio: "inherit" },
    );
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0 || code === null) return resolve(0);
      resolve(code);
    });
  });
}

async function createHandler(options = {}) {
  const fromSunrc = await readSunrcCandidates();
  if (!fromSunrc || !fromSunrc.config || !fromSunrc.config.services) {
    console.log();
    console.log(`${ui.status.error()} Could not find services in .sunrc`);
    console.log(
      colors.dim(
        "  Add .sunrc in this repo (or ~/envflow/sun-cli/.sunrc), then retry sun ctx create",
      ),
    );
    process.exit(1);
  }

  const sunrcDir = path.dirname(fromSunrc.path);
  const defaults = fromSunrc.config.defaults || {};
  const serviceNames = Object.keys(fromSunrc.config.services);

  if (serviceNames.length === 0) {
    console.log(`${ui.status.warning()} No services defined in .sunrc`);
    process.exit(1);
  }

  const deployedServiceNames = resolveDeployedServiceNames({
    serviceNames,
    servicesOption: options.services,
  });

  if (deployedServiceNames.length === 0) {
    console.log(
      `${ui.status.error()} No matching services selected. Check --services against .sunrc keys.`,
    );
    process.exit(1);
  }

  const defaultWatch = resolveDefaultWatchedServices({
    deployedServiceNames,
    watchOption: options.watch,
    yes: options.yes,
  });

  const { envName, watchedServices } = await promptMissingInputs({
    envName: options.name,
    watchedServices: defaultWatch,
    serviceNames: deployedServiceNames,
  });

  try {
    ensureClusterContext({ requestedCluster: options.cluster });
  } catch (err) {
    console.log();
    console.log(`${ui.status.error()} ${err.message}`);
    process.exit(1);
  }

  const servicesConfig = Object.fromEntries(
    deployedServiceNames.map((name) => [name, fromSunrc.config.services[name]]),
  );

  let devspaceConfig;
  try {
    devspaceConfig = buildDevspaceConfig({
      envName,
      servicesConfig,
      watchedServices,
      defaults,
      sunrcDir,
    });
  } catch (err) {
    console.log();
    console.log(`${ui.status.error()} ${err.message}`);
    process.exit(1);
  }

  await fs.mkdir(paths.ephemeralDir(), { recursive: true });

  const devspaceFilePath = path.join(
    paths.ephemeralDir(),
    `devspace-${envName}.yaml`,
  );

  await fs.writeFile(
    devspaceFilePath,
    yaml.dump(devspaceConfig, { indent: 2, lineWidth: -1, noRefs: true }),
  );

  console.log();
  console.log(ui.subheader("Context created"));
  console.log(
    `  ${ui.status.success()} Environment: ${colors.accent(envName)}`,
  );
  console.log(
    `  ${ui.status.info()} Cluster: ${colors.accent(options.cluster || "minikube")}`,
  );
  console.log(
    `  ${ui.status.info()} Deployed services: ${deployedServiceNames.join(", ")}`,
  );
  console.log(
    `  ${ui.status.info()} Watched services: ${watchedServices.join(", ")}`,
  );
  console.log(`  ${ui.status.info()} Wrote: ${devspaceFilePath}`);

  const namespace = `devspace-${envName}`;

  if (options.deploy === false) {
    console.log();
    console.log(
      colors.dim(
        `Skipping deploy (--no-deploy). To run later:\n  devspace dev --config ${devspaceFilePath} --namespace ${namespace}`,
      ),
    );
    return;
  }

  console.log();
  console.log(ui.subheader("Starting DevSpace"));
  console.log(
    colors.dim(
      `  devspace dev --config ${devspaceFilePath} --namespace ${namespace}`,
    ),
  );
  console.log();

  const code = await spawnDevspaceDev({
    configPath: devspaceFilePath,
    namespace,
  });
  if (code !== 0) {
    console.log();
    console.log(`${ui.status.error()} DevSpace exited with code ${code}`);
    process.exit(code);
  }
}

module.exports = createHandler;
