const { doctorCommand } = require('./doctor');
const { riseCommand } = require('./rise');

const commands = {
  doctor: doctorCommand,
  rise: riseCommand,
};

const printHelp = () => {
  console.log('Usage: lenv [command] [options]');
  console.log('');
  console.log('Commands:');
  Object.values(commands).forEach(cmd => {
    console.log(`  ${cmd.name.padEnd(12)} ${cmd.description}`);
  });
};

module.exports = { commands, printHelp };
