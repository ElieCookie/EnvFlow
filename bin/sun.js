#!/usr/bin/env node
const { Command } = require('commander');
const packageJson = require('../package.json');
const colors = require('../src/utils/colors');

const doctorHandler = require('../src/commands/doctor');
const { riseHandler } = require('../src/commands/rise');

const program = new Command();

program
  .name('sun')
  .description('☀️  Sun CLI - Platform Infrastructure Management')
  .version(packageJson.version, '-v, --version', 'display version number');

program
  .command('rise')
  .description('Configure and set up the development environment')
  .action(riseHandler);

program
  .command('doctor')
  .description('🩺  Check system health and configuration')
  .action(doctorHandler);

program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name() + ' ' + cmd.usage()
});

program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ sun rise                     # Initial setup and clone repos');
  console.log('  $ sun doctor                   # Check system health');
  console.log('');
  console.log('For more information, visit: https://github.com/ElieCookie/EnvFlow');
});

program.exitOverride();

const GRACEFUL_EXITS = new Set([
  'commander.help',
  'commander.version',
  'commander.helpDisplayed'
]);

try {
  program.parse(process.argv);

  if (process.argv.length <= 2) {
    program.help();
  }
} catch (err) {
  if (GRACEFUL_EXITS.has(err.code)) {
    process.exit(0);
  }
  console.error(colors.red('Error:'), err.message);
  process.exit(1);
}
