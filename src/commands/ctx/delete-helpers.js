const fs = require("fs").promises;
const path = require("path");

const { sanitizeEnvName } = require("./shared");
const { contextConfigPath, listContextNames } = require("./context-store");

function resolveDeleteEnvName({ requestedName, envs }) {
  if (!requestedName) return null;

  const envName = sanitizeEnvName(requestedName);
  if (!envs.includes(envName)) {
    throw new Error(`Context "${envName}" was not found`);
  }
  return envName;
}

function localContextFiles({ ephemeralDir, envName }) {
  return [
    contextConfigPath(envName, ephemeralDir),
    path.join(ephemeralDir, `${envName}.yaml`),
    path.join(ephemeralDir, `devspace-${envName}.log`),
    path.join(ephemeralDir, `.devspace-${envName}.log`),
  ];
}

async function removeLocalFiles({ ephemeralDir, envName }) {
  const files = localContextFiles({ ephemeralDir, envName });
  await Promise.all(files.map((file) => fs.rm(file, { force: true })));
}

async function removeDevspaceStateWhenUnused(ephemeralDir) {
  const remainingContexts = await listContextNames({ ephemeralDir });
  if (remainingContexts.length > 0) return false;

  await fs.rm(path.join(ephemeralDir, ".devspace"), {
    recursive: true,
    force: true,
  });
  return true;
}

module.exports = {
  resolveDeleteEnvName,
  localContextFiles,
  removeLocalFiles,
  removeDevspaceStateWhenUnused,
};
