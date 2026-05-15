#!/usr/bin/env node
const { commands, printHelp } = require('../src/commands');

const main = async () => {
  const argv = process.argv.slice(2);
  const first = argv[0];

  if (!first || first === '-h' || first === '--help' || first === 'help') {
    printHelp();
    process.exit(0);
  }

  if (commands[first]) {
    const code = await commands[first].handler(argv.slice(1));
    process.exit(code);
  }

  console.error(`Unknown command: ${first}`);
  printHelp();
  process.exit(1);
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
