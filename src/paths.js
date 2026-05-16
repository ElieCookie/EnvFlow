const path = require('path');
const os = require('os');

const REPO_ROOT = path.resolve(__dirname, '..');

function workspaceDir() {
  return path.join(os.homedir(), 'envflow');
}

function ephemeralDir() {
  return path.join(os.homedir(), '.envflow-ephemeral');
}

function envflowConfigPath() {
  return path.join(os.homedir(), '.envflow', 'config.json');
}

module.exports = {
  REPO_ROOT,
  workspaceDir,
  ephemeralDir,
  envflowConfigPath
};
