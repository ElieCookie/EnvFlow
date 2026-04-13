const ui = require('../utils/ui');
const { TOOLS, ensureToolInstalled, delay } = require('../utils/tools');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const DIRS = {
  workspace: () => path.join(os.homedir(), 'envflow'),
  ephemeral: () => path.join(os.homedir(), '.envflow-ephemeral')
};

async function riseHandler() {
  console.log();
  console.log(ui.subheader('Checking Prerequisites'));

  for (const tool of TOOLS) {
    const ok = await ensureToolInstalled(tool);
    if (!ok && tool.required) return;
  }

  console.log();
  console.log(ui.subheader('Setting Up Directories'));

  process.stdout.write(`  ${ui.status.pending()} Creating directory structure`);
  try {
    await fs.mkdir(DIRS.workspace(), { recursive: true });
    await fs.mkdir(DIRS.ephemeral(), { recursive: true });
    await delay(300);
    process.stdout.write(`\r  ${ui.status.success()} Directory structure created                   \n`);
  } catch (error) {
    process.stdout.write(`\r  ${ui.status.error()} Failed to create directories: ${error.message}\n`);
    return;
  }

  console.log();
  console.log(`${ui.status.success()} Sun CLI setup complete`);
}

module.exports = { riseHandler };
