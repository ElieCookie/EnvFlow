#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

if (process.env.npm_config_global !== 'true') process.exit(0);

const envflowDir = path.join(os.homedir(), 'envflow');
const sunCliDir = path.join(envflowDir, 'sun-cli');

if (fs.existsSync(sunCliDir)) {
  console.log('✓ sun-cli repository already exists at ~/envflow/sun-cli');
  process.exit(0);
}

console.log('Setting up Sun CLI...');

try {
  fs.mkdirSync(envflowDir, { recursive: true });
  execSync('git clone https://github.com/ElieCookie/EnvFlow.git sun-cli', {
    cwd: envflowDir,
    stdio: 'inherit'
  });
  console.log('✓ Sun CLI repository cloned to ~/envflow/sun-cli');
  console.log('');
  console.log('Run "sun rise" to complete the installation');
} catch {
  console.error('Warning: Could not clone repository automatically');
  console.error('Clone manually: git clone https://github.com/ElieCookie/EnvFlow.git ~/envflow/sun-cli');
}
