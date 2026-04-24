const path = require('path');
const os = require('os');

const REPO_ROOT = path.resolve(__dirname, '..');

function workspaceDir() {
  return path.join(os.homedir(), 'envflow');
}

function ephemeralDir() {
  return path.join(os.homedir(), '.envflow-ephemeral');
}

function helmChartsRepoPath() {
  return path.join(REPO_ROOT, 'helm-charts');
}

function helmChartsEphemeralPath() {
  return path.join(ephemeralDir(), 'helm-charts');
}

function envflowConfigPath() {
  return path.join(os.homedir(), '.envflow', 'config.json');
}

module.exports = {
  REPO_ROOT,
  workspaceDir,
  ephemeralDir,
  helmChartsRepoPath,
  helmChartsEphemeralPath,
  envflowConfigPath
};
