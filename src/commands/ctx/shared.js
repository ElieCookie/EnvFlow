const path = require("path");
const paths = require("../../paths");

function parseCsvList(value) {
  if (!value || typeof value !== "string") return [];
  return Array.from(
    new Set(
      value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  );
}

function sanitizeEnvName(name) {
  const normalized = String(name || "")
    .trim()
    .toLowerCase();
  if (!/^[a-z0-9-]+$/.test(normalized)) {
    throw new Error(
      "Environment name must contain only lowercase letters, numbers, and hyphens",
    );
  }
  return normalized;
}

function splitHost(host) {
  if (!host) return { hostname: undefined, pathPrefix: undefined };
  const [first, ...rest] = host.split("/");
  if (!first) return { hostname: undefined, pathPrefix: undefined };
  return {
    hostname: first,
    pathPrefix: rest.length ? `/${rest.join("/")}` : "/",
  };
}

function buildDevspaceConfig({ envName, servicesConfig, watchedServices }) {
  const chartPath = path.join(
    paths.helmChartsEphemeralPath(),
    "charts",
    "service-routes",
  );

  const devspaceConfig = {
    version: "v2beta1",
    name: envName,
    deployments: {
      services: {
        helm: {
          chart: {
            name: chartPath,
          },
          valuesFiles: [`./${envName}.yaml`],
        },
      },
    },
    dev: {},
    pipelines: {
      dev: {
        run: "create_deployments --all\nstart_dev --all --continue-on-terminal-exit",
      },
    },
  };

  for (const [serviceName, service] of Object.entries(servicesConfig)) {
    const repoName = service.repo || serviceName;
    const repoPath = path.join(paths.workspaceDir(), repoName);
    const isWatched = watchedServices.includes(serviceName);

    const installCmd = service.install || "npm install";
    const devCmd = service.command || "npm run dev";

    devspaceConfig.dev[serviceName] = {
      labelSelector: {
        service: `${envName}-${serviceName}`,
      },
      command: ["sh", "-c", `cd /usr/src/app && ${installCmd} && ${devCmd}`],
      sync: [
        {
          path: `${repoPath}:/usr/src/app`,
          excludePaths: [".git/", "node_modules/", "dist/", ".devspace/"],
          startContainer: true,
          ...(isWatched ? {} : { noWatch: true, initialSync: "preferLocal" }),
        },
      ],
    };
  }

  return devspaceConfig;
}

function buildValuesConfig({ envName, servicesConfig }) {
  return {
    environmentName: envName,
    imageBase: "node",
    services: Object.entries(servicesConfig).map(([serviceName, service]) => {
      const host = splitHost(service.host);
      return {
        name: `${envName}-${serviceName}`,
        port: Number(service.port || 8080),
        ...(host.hostname ? { hostname: host.hostname } : {}),
        ...(host.pathPrefix ? { pathPrefix: host.pathPrefix } : {}),
      };
    }),
  };
}

module.exports = {
  parseCsvList,
  sanitizeEnvName,
  splitHost,
  buildDevspaceConfig,
  buildValuesConfig,
};
