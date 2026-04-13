const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const colors = require('../utils/colors');
const ui = require('../utils/ui');
const { checkToolExists } = require('../utils/tools');

const TOOL_CHECKS = [
  { name: 'DevSpace', bin: 'devspace', fix: 'brew install devspace' },
  { name: 'AWS CLI', bin: 'aws', fix: 'brew install awscli' },
  { name: 'kubectl', bin: 'kubectl', fix: 'brew install kubectl' }
];

async function doctorHandler() {
  try {
    const issues = [];

    console.log();
    console.log(ui.subheader('Required Tools'));
    await checkTools(issues);

    console.log();
    console.log(ui.subheader('Directory Structure'));
    await checkDirectories(issues);

    console.log();
    printResults(issues);
  } catch (error) {
    console.log();
    console.log(`${ui.status.error()} Doctor check failed: ${error.message}`);
    process.exit(1);
  }
}

async function checkTools(issues) {
  for (const tool of TOOL_CHECKS) {
    const found = await checkToolExists(tool);
    if (!found) issues.push(`Install ${tool.name}: ${tool.fix}`);
  }
}

async function checkDirectories(issues) {
  const ephemeralDir = path.join(os.homedir(), '.envflow-ephemeral');

  process.stdout.write(`  ${ui.status.pending()} Checking ~/.envflow-ephemeral`);

  const exists = await fs.access(ephemeralDir).then(() => true, () => false);

  if (!exists) {
    process.stdout.write(`\r  ${ui.status.error()} ~/.envflow-ephemeral missing                  \n`);
    issues.push(`Create directory: mkdir -p ${ephemeralDir}`);
    return;
  }

  process.stdout.write(`\r  ${ui.status.success()} ~/.envflow-ephemeral exists                   \n`);

  const files = await fs.readdir(ephemeralDir);
  const envFiles = files.filter(f => f.startsWith('devspace-') && f.endsWith('.yaml'));
  if (envFiles.length === 0) return;

  const envNames = envFiles.map(f => f.replace('devspace-', '').replace('.yaml', '')).join(', ');
  console.log(`  ${ui.status.info()} ${envFiles.length} environment(s): ${colors.dim(envNames)}`);
}

function printResults(issues) {
  if (issues.length === 0) {
    console.log(`${ui.status.success()} All checks passed`);
    console.log(colors.dim('  Sun CLI is ready to use'));
    return;
  }

  console.log(`${ui.status.error()} Issues found (${issues.length})`);
  console.log();
  issues.forEach(issue => console.log(`  ${ui.status.bullet()} ${colors.text(issue)}`));
  console.log();
  console.log(`${ui.status.info()} Quick fix: Run ${colors.accent('sun rise')} to resolve most issues automatically`);
  process.exit(1);
}

module.exports = doctorHandler;
