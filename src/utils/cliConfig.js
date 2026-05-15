const path = require('path');
const fs = require('fs');
const YAML = require('yaml');

const CONFIG_BASENAMES = ['lenv.config.js', 'lenv.config.yaml', 'lenv.config.yml', '.lenvrc.yaml'];

const loadByExt = filePath => {
  const ext = path.extname(filePath);
  if (ext === '.js') return require(filePath);
  const raw = fs.readFileSync(filePath, 'utf8');
  return YAML.parse(raw) || {};
};

const findConfigPath = (cwd = process.cwd()) => {
  for (const name of CONFIG_BASENAMES) {
    const full = path.join(cwd, name);
    if (fs.existsSync(full)) return full;
  }
  return null;
};

const loadCliConfig = (cwd = process.cwd()) => {
  const found = findConfigPath(cwd);
  if (!found) return {};
  try {
    return loadByExt(found) || {};
  } catch (err) {
    throw new Error(`Failed to load ${found}: ${err.message}`);
  }
};

module.exports = { findConfigPath, loadCliConfig };
