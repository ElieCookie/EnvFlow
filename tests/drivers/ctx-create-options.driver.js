const {
  resolveDeployedServiceNames,
  resolveDefaultWatchedServices,
} = require("../../src/commands/ctx/create-options");

class CtxCreateOptionsDriver {
  setup() {}

  clearMocks() {
    jest.clearAllMocks();
  }

  resolveDeployedServiceNames(input) {
    return resolveDeployedServiceNames(input);
  }

  resolveDefaultWatchedServices(input) {
    return resolveDefaultWatchedServices(input);
  }
}

module.exports = { CtxCreateOptionsDriver };
