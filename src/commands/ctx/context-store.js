const fs = require("fs").promises;
const path = require("path");
const yaml = require("js-yaml");

const paths = require("../../paths");

function contextConfigPath(envName, ephemeralDir = paths.ephemeralDir()) {
  return path.join(ephemeralDir, `devspace-${envName}.yaml`);
}

async function listContextNames({ ephemeralDir = paths.ephemeralDir() } = {}) {
  try {
    const files = await fs.readdir(ephemeralDir);
    return files
      .filter((file) => file.startsWith("devspace-") && file.endsWith(".yaml"))
      .map((file) => file.replace("devspace-", "").replace(".yaml", ""))
      .sort();
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function countContextServices(
  envName,
  { ephemeralDir = paths.ephemeralDir() } = {},
) {
  try {
    const content = await fs.readFile(
      contextConfigPath(envName, ephemeralDir),
      "utf8",
    );
    const config = yaml.load(content) || {};
    return Object.keys(config.dev || {}).length;
  } catch {
    return 0;
  }
}

async function listContextSummaries({ ephemeralDir = paths.ephemeralDir() } = {}) {
  const names = await listContextNames({ ephemeralDir });
  return Promise.all(
    names.map(async (name) => ({
      name,
      serviceCount: await countContextServices(name, { ephemeralDir }),
    })),
  );
}

module.exports = {
  contextConfigPath,
  listContextNames,
  countContextServices,
  listContextSummaries,
};
