const { execSync, exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const ui = require('./ui');

const SILENT = { stdio: 'pipe' };

const TOOLS = [
  { name: 'AWS CLI', bin: 'aws', check: 'aws --version', install: 'brew install awscli' },
  { name: 'kubectl', bin: 'kubectl', check: 'kubectl version --client', install: 'brew install kubectl' },
  { name: 'Git', bin: 'git', check: 'git --version', required: true },
  {
    name: 'DevSpace',
    bin: 'devspace',
    check: 'devspace --version',
    install: 'curl -L -o devspace "https://github.com/loft-sh/devspace/releases/latest/download/devspace-darwin-amd64" && chmod +x devspace && sudo mv devspace /usr/local/bin'
  }
];

function tryExecSync(cmd) {
  try { execSync(cmd, SILENT); return true; } catch { return false; }
}

async function tryExecAsync(cmd) {
  try { await execAsync(cmd); return true; } catch { return false; }
}

function writeLine(icon, label, name) {
  process.stdout.write(`\r  ${icon} ${name} ${label}${pad(name)}\n`);
}

async function ensureToolInstalled(tool) {
  process.stdout.write(`  ${ui.status.pending()} Checking ${tool.name}`);

  if (tryExecSync(tool.check)) {
    await delay(200);
    writeLine(ui.status.success(), 'installed', tool.name);
    return true;
  }

  if (!tool.install) {
    writeLine(ui.status.error(), 'not found. Please install it first', tool.name);
    return false;
  }

  writeLine(ui.status.warning(), 'not found, installing...', tool.name);

  if (tryExecSync(tool.install)) {
    process.stdout.write(`  ${ui.status.success()} ${tool.name} installed successfully\n`);
    return true;
  }

  process.stdout.write(`  ${ui.status.error()} Failed to install ${tool.name}\n`);
  return false;
}

async function checkToolExists({ name, bin }) {
  process.stdout.write(`  ${ui.status.pending()} Checking ${name}`);
  const found = await tryExecAsync(`which ${bin}`);
  writeLine(
    found ? ui.status.success() : ui.status.error(),
    found ? 'installed' : 'not installed',
    name
  );
  return found;
}

function pad(name) {
  return ' '.repeat(Math.max(0, 40 - name.length));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { TOOLS, ensureToolInstalled, checkToolExists, delay };
