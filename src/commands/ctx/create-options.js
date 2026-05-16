const { parseCsvList } = require("./shared");

function resolveDeployedServiceNames({ serviceNames, servicesOption }) {
  const selectedServices = parseCsvList(servicesOption);
  if (selectedServices.length === 0) return serviceNames;

  return serviceNames.filter((name) => selectedServices.includes(name));
}

function resolveDefaultWatchedServices({ deployedServiceNames, watchOption, yes }) {
  const watchedFromOpt = parseCsvList(watchOption);
  if (watchedFromOpt.length > 0) {
    return deployedServiceNames.filter((name) => watchedFromOpt.includes(name));
  }

  return yes ? deployedServiceNames : [];
}

module.exports = {
  resolveDeployedServiceNames,
  resolveDefaultWatchedServices,
};
