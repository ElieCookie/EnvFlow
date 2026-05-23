const path = require("path");
const paths = require("../paths");

const DB_ENGINE_PRESETS = {
  mysql: {
    image: "mysql:8.0",
    port: 3306,
    env: {},
  },
  postgres: {
    image: "postgres:16-alpine",
    port: 5432,
    env: {
      POSTGRES_USER: "postgres",
      POSTGRES_PASSWORD: "postgres",
      POSTGRES_DB: "app",
    },
  },
};

function defaultDbChartPath() {
  return path.join(paths.REPO_ROOT, "helm-charts", "db");
}

function resolveDbEngine(dbConfig, dbName) {
  const engine = dbConfig?.engine || "mysql";
  const preset = DB_ENGINE_PRESETS[engine];
  if (!preset) {
    throw new Error(
      `Unsupported database engine "${engine}" for "${dbName}". Use mysql or postgres.`,
    );
  }
  return { engine, preset };
}

function buildDbHelmValues(dbName, dbConfig, envName) {
  const { engine, preset } = resolveDbEngine(dbConfig, dbName);
  const customValues = dbConfig.values || {};

  return {
    name: `${envName}-${dbName}`,
    engine,
    port: Number(dbConfig.port || preset.port),
    image: dbConfig.image || preset.image,
    env: {
      ...preset.env,
      ...(dbConfig.env || {}),
      ...(customValues.env || {}),
    },
    ...customValues,
  };
}

function buildServiceDbEnv(dbName, dbConfig, dbFullName) {
  const { engine, preset } = resolveDbEngine(dbConfig, dbName);
  const env = {
    ...preset.env,
    ...(dbConfig.env || {}),
  };

  if (engine === "mysql") {
    return {
      MYSQL_HOST: dbFullName,
      MYSQL_ROOT_PASSWORD: env.MYSQL_ROOT_PASSWORD || "admin",
    };
  }

  const user = env.POSTGRES_USER || "postgres";
  const password = env.POSTGRES_PASSWORD || "postgres";
  const database = env.POSTGRES_DB || user;
  const port = Number(dbConfig.port || preset.port);

  return {
    PGHOST: dbFullName,
    PGPORT: String(port),
    PGUSER: user,
    PGPASSWORD: password,
    PGDATABASE: database,
    DATABASE_URL: `postgresql://${user}:${password}@${dbFullName}:${port}/${database}`,
  };
}

module.exports = {
  DB_ENGINE_PRESETS,
  defaultDbChartPath,
  buildDbHelmValues,
  buildServiceDbEnv,
  resolveDbEngine,
};
