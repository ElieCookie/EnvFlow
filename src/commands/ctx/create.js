const fs = require("fs").promises;
const path = require("path");
const yaml = require("js-yaml");
const inquirer = require("inquirer");

const ui = require("../../utils/ui");
const colors = require("../../utils/colors");
const paths = require("../../paths");
const { readSunrcCandidates } = require("../../utils/sunrc");
const {
  parseCsvList,
  sanitizeEnvName,
  buildDevspaceConfig,
  buildValuesConfig,
} = require("./shared");

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

  const serviceNames = Object.keys(fromSunrc.config.services);
  if (serviceNames.length === 0) {
    console.log(`${ui.status.warning()} No services defined in .sunrc`);
    process.exit(1);
  }

  const selectedServices = parseCsvList(options.services);
  const watchedFromOpt = parseCsvList(options.watch);

  const deployedServiceNames =
    selectedServices.length > 0
      ? serviceNames.filter((name) => selectedServices.includes(name))
      : serviceNames;

  if (deployedServiceNames.length === 0) {
    console.log(
      `${ui.status.error()} No matching services selected. Check --services against .sunrc keys.`,
    );
    process.exit(1);
  }

  const defaultWatch =
    watchedFromOpt.length > 0
      ? deployedServiceNames.filter((name) => watchedFromOpt.includes(name))
      : options.yes
        ? deployedServiceNames
        : [];

  const { envName, watchedServices } = await promptMissingInputs({
    envName: options.name,
    watchedServices: defaultWatch,
    serviceNames: deployedServiceNames,
  });

  const servicesConfig = Object.fromEntries(
    deployedServiceNames.map((name) => [name, fromSunrc.config.services[name]]),
  );

  const devspaceConfig = buildDevspaceConfig({
    envName,
    servicesConfig,
    watchedServices,
  });
  const valuesConfig = buildValuesConfig({ envName, servicesConfig });

  await fs.mkdir(paths.ephemeralDir(), { recursive: true });

  const devspaceFilePath = path.join(
    paths.ephemeralDir(),
    `devspace-${envName}.yaml`,
  );
  const valuesFilePath = path.join(paths.ephemeralDir(), `${envName}.yaml`);

  await fs.writeFile(
    devspaceFilePath,
    yaml.dump(devspaceConfig, { indent: 2, lineWidth: -1, noRefs: true }),
  );
  await fs.writeFile(
    valuesFilePath,
    yaml.dump(valuesConfig, { indent: 2, lineWidth: -1, noRefs: true }),
  );

  console.log();
  console.log(ui.subheader("Context created"));
  console.log(
    `  ${ui.status.success()} Environment: ${colors.accent(envName)}`,
  );
  console.log(
    `  ${ui.status.info()} Deployed services: ${deployedServiceNames.join(", ")}`,
  );
  console.log(
    `  ${ui.status.info()} Watched services: ${watchedServices.join(", ")}`,
  );
  console.log(`  ${ui.status.info()} Wrote: ${devspaceFilePath}`);
  console.log(`  ${ui.status.info()} Wrote: ${valuesFilePath}`);
  console.log();
  console.log(
    colors.dim(
      `Next: devspace dev --config ${devspaceFilePath} --namespace devspace-${envName}`,
    ),
  );
}

module.exports = createHandler;
