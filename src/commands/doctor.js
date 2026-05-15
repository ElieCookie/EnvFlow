const { loadCliConfig, findConfigPath } = require('../utils/cliConfig');
const { which, run } = require('../utils/exec');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const checkTool = async tool => {
  if (tool.check) {
    const res = await run(tool.check);
    return {
      ok: res.ok,
      detail: res.ok ? res.stdout.trim().split('\n')[0] : res.stderr.trim().split('\n')[0],
    };
  }
  const ok = await which(tool.name);
  return { ok, detail: ok ? 'found in PATH' : 'not in PATH' };
};

const handler = async () => {
  const configPath = findConfigPath();
  if (!configPath) {
    console.log(`${YELLOW}No lenv config file found${RESET}`);
    console.log(`${DIM}Create lenv.config.js, lenv.config.yaml, or .lenvrc.yaml in the project root.${RESET}`);
    return 1;
  }

  const config = loadCliConfig();
  const tools = config.tools || [];

  console.log(`${DIM}Config: ${configPath}${RESET}`);

  if (tools.length === 0) {
    console.log(`${YELLOW}No tools defined under \`tools:\` in config${RESET}`);
    return 0;
  }

  let failures = 0;
  for (const tool of tools) {
    const { ok, detail } = await checkTool(tool);
    if (ok) {
      console.log(`${GREEN}OK${RESET}      ${tool.name.padEnd(14)} ${DIM}${detail}${RESET}`);
    } else if (tool.optional) {
      console.log(`${YELLOW}SKIP${RESET}    ${tool.name.padEnd(14)} ${DIM}optional, ${detail}${RESET}`);
    } else {
      console.log(`${RED}MISSING${RESET} ${tool.name.padEnd(14)} ${DIM}${detail}${RESET}`);
      if (tool.install) {
        console.log(`        ${DIM}install:${RESET} ${tool.install}`);
      }
      failures++;
    }
  }

  console.log('');
  if (failures > 0) {
    console.log(`${RED}${failures} required tool(s) missing${RESET}`);
    console.log(`${DIM}Run \`lenv rise\` to install missing tools.${RESET}`);
    return 1;
  }
  console.log(`${GREEN}All required tools present${RESET}`);
  return 0;
};

const doctorCommand = {
  name: 'doctor',
  description: 'Check required tools and config health',
  handler,
};

module.exports = { doctorCommand };
