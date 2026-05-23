const path = require("path");
const fs = require("fs");
const paths = require("../../paths");
const { resolveChart } = require("../../utils/chart-resolver");
const {
  buildDbHelmValues,
  buildServiceDbEnv,
  defaultDbChartPath,
} = require("../../utils/db");
const { execSync } = require("child_process");

function currentKubectlContext() {
  try {
    return execSync("kubectl config current-context", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function ensureClusterContext({ requestedCluster, currentContext } = {}) {
  const current =
    currentContext === undefined ? currentKubectlContext() : currentContext;
  if (!current) {
    throw new Error(
      "kubectl has no current context. Run `minikube start` or `kubectl config use-context <name>`.",
    );
  }

  const expected = requestedCluster || "minikube";
  if (current === expected) return current;

  if (!requestedCluster) {
    throw new Error(
      `Current kubectl context is "${current}", expected "minikube". ` +
        `Run \`minikube start\` first, or pass --cluster ${current} to target this cluster explicitly.`,
    );
  }

  throw new Error(
    `Current kubectl context is "${current}", but --cluster=${requestedCluster} was requested. ` +
      `Switch context first: \`kubectl config use-context ${requestedCluster}\`.`,
  );
}

function resolveRepoRoot(service, serviceName, sunrcDir) {
  const repoName = service.repo || serviceName;
  if (path.isAbsolute(repoName)) return repoName;

  const sibling = path.resolve(sunrcDir, repoName);
  if (fs.existsSync(sibling)) return sibling;

  return path.join(paths.workspaceDir(), repoName);
}

function resolveRepoPath(service, serviceName, sunrcDir) {
  if (service.repoPath) {
    const repoPath = service.repoPath;
    if (path.isAbsolute(repoPath)) return repoPath;
    if (service.repo) {
      return path.resolve(
        resolveRepoRoot(service, serviceName, sunrcDir),
        repoPath,
      );
    }
    return path.resolve(sunrcDir, repoPath);
  }
  return resolveRepoRoot(service, serviceName, sunrcDir);
}

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

function buildDevspaceConfig({
  envName,
  servicesConfig,
  databasesConfig = {},
  watchedServices,
  defaults = {},
  sunrcDir = process.cwd(),
}) {
  const devspaceConfig = {
    version: "v2beta1",
    name: envName,
    deployments: {},
    dev: {},
    pipelines: {
      dev: {
        run: "create_deployments --all\nstart_dev --all --continue-on-terminal-exit",
      },
    },
  };

  for (const [dbName, dbConfig] of Object.entries(databasesConfig)) {
    const helmDbValues = buildDbHelmValues(dbName, dbConfig, envName);
    const fullName = helmDbValues.name;
    const port = helmDbValues.port;
    const chartPath = dbConfig.chart
      ? resolveChart(dbConfig.chart, sunrcDir)
      : defaultDbChartPath();

    devspaceConfig.deployments[dbName] = {
      helm: {
        chart: { name: chartPath },
        values: helmDbValues,
      },
    };

    devspaceConfig.dev[dbName] = {
      labelSelector: { service: fullName },
      ports: [{ port: `${port}` }],
    };
  }

  for (const [serviceName, service] of Object.entries(servicesConfig)) {
    const fullName = `${envName}-${serviceName}`;
    const repoPath = resolveRepoPath(service, serviceName, sunrcDir);
    const port = Number(service.port || defaults.port || 8080);
    const image = service.image || defaults.image || "node:20-alpine";
    const workingDir =
      service.workingDir || defaults.workingDir || "/usr/src/app";
    const installCmd = service.install || defaults.install || "npm install";
    const devCmd = service.command || defaults.command || "npm run dev";
    const isWatched = watchedServices.includes(serviceName);
    const deployOnly = service.deployOnly === true;

    if (service.db && !databasesConfig[service.db]) {
      throw new Error(
        `Service "${serviceName}" references unknown database "${service.db}"`,
      );
    }

    const chartPath = resolveChart(service.chart, sunrcDir);

    const serviceValues = { ...(service.values || {}) };
    if (service.db) {
      const dbConfig = databasesConfig[service.db];
      const dbFullName = `${envName}-${service.db}`;
      const dbEnv = buildServiceDbEnv(service.db, dbConfig, dbFullName);
      serviceValues.env = {
        ...dbEnv,
        ...(serviceValues.env || {}),
      };
    }

    const helmValues = {
      name: fullName,
      port,
      image,
      ...(deployOnly ? {} : { workingDir }),
      ...serviceValues,
    };

    devspaceConfig.deployments[serviceName] = {
      helm: {
        chart: { name: chartPath },
        values: helmValues,
      },
    };

    if (deployOnly) continue;

    devspaceConfig.dev[serviceName] = {
      labelSelector: { service: fullName },
      command: ["sh", "-c", `cd ${workingDir} && ${installCmd} && ${devCmd}`],
      ports: [{ port: `${port}` }],
      sync: [
        {
          path: `${repoPath}:${workingDir}`,
          excludePaths: [".git/", "node_modules/", "dist/", ".devspace/"],
          startContainer: true,
          ...(isWatched ? {} : { noWatch: true, initialSync: "preferLocal" }),
        },
      ],
    };
  }

  return devspaceConfig;
}

module.exports = {
  currentKubectlContext,
  ensureClusterContext,
  resolveRepoPath,
  parseCsvList,
  sanitizeEnvName,
  splitHost,
  buildDevspaceConfig,
};
