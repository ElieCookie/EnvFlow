const { loadCliConfig, findConfigPath } = require('../utils/cliConfig');
const { which, run, spawnInherit } = require('../utils/exec');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const isToolPresent = async tool => {
  if (tool.check) {
    const res = await run(tool.check);
    return res.ok;
  }
  return which(tool.name);
};

const installTool = async tool => {
  if (!tool.install) {
    console.log(`${YELLOW}!${RESET} ${tool.name}: no \`install\` command in config, skipping`);
    return false;
  }
  console.log(`${CYAN}>${RESET} installing ${tool.name}: ${DIM}${tool.install}${RESET}`);
  const code = await spawnInherit('sh', ['-c', tool.install]);
  return code === 0;
};

const applyKubeContext = async kube => {
  if (!kube || (!kube.name && !kube.cluster)) return;
  const hasKubectl = await which('kubectl');
  if (!hasKubectl) {
    console.log(`${RED}kubectl not installed; cannot apply kube context${RESET}`);
    return;
  }
  if (kube.name) {
    console.log(`${CYAN}>${RESET} kubectl config use-context ${kube.name}`);
    await spawnInherit('kubectl', ['config', 'use-context', kube.name]);
  }
  if (kube.namespace) {
    console.log(`${CYAN}>${RESET} kubectl set namespace ${kube.namespace}`);
    await spawnInherit('kubectl', [
      'config',
      'set-context',
      '--current',
      `--namespace=${kube.namespace}`,
    ]);
  }
};

const handler = async () => {
  const configPath = findConfigPath();
  if (!configPath) {
    console.log(`${YELLOW}No lenv config file found${RESET}`);
    return 1;
  }

  const config = loadCliConfig();
  const tools = config.tools || [];

  console.log(`${DIM}Config: ${configPath}${RESET}`);

  let installed = 0;
  let failed = 0;
  for (const tool of tools) {
    const present = await isToolPresent(tool);
    if (present) {
      console.log(`${GREEN}=${RESET} ${tool.name} already installed`);
      continue;
    }
    if (tool.optional && !tool.install) {
      console.log(`${DIM}- ${tool.name} optional, no install command${RESET}`);
      continue;
    }
    const ok = await installTool(tool);
    if (ok) {
      installed++;
      console.log(`${GREEN}+${RESET} ${tool.name} installed`);
    } else {
      failed++;
      console.log(`${RED}x${RESET} ${tool.name} install failed`);
    }
  }

  if (config.kube) {
    await applyKubeContext(config.kube);
  }

  console.log('');
  console.log(`${DIM}installed: ${installed}, failed: ${failed}${RESET}`);
  return failed > 0 ? 1 : 0;
};

const riseCommand = {
  name: 'rise',
  description: 'Install missing tools and apply kube context from config',
  handler,
};

module.exports = { riseCommand };
