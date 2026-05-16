const inquirer = require("inquirer");

function prompt(questions) {
  return promptFunction()(questions);
}

function promptFunction() {
  const promptFn = inquirer.prompt || inquirer.default?.prompt;
  if (!promptFn) {
    throw new Error("Installed inquirer package does not expose prompt()");
  }
  return promptFn;
}

module.exports = { prompt, promptFunction };
