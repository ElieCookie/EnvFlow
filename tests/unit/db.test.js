const path = require("path");
const {
  buildDbHelmValues,
  buildServiceDbEnv,
  defaultDbChartPath,
  resolveDbEngine,
} = require("../../src/utils/db");
const paths = require("../../src/paths");

describe("db helpers", () => {
  test("buildDbHelmValues sets mysql engine defaults", () => {
    const values = buildDbHelmValues(
      "shop-db",
      {
        engine: "mysql",
        env: {
          MYSQL_ROOT_PASSWORD: "admin",
          MYSQL_DATABASE: "shopping_db",
        },
      },
      "shop",
    );

    expect(values).toEqual({
      name: "shop-shop-db",
      engine: "mysql",
      port: 3306,
      image: "mysql:8.0",
      env: {
        MYSQL_ROOT_PASSWORD: "admin",
        MYSQL_DATABASE: "shopping_db",
      },
    });
  });

  test("buildServiceDbEnv maps mysql host for linked services", () => {
    const env = buildServiceDbEnv(
      "shop-db",
      {
        engine: "mysql",
        env: { MYSQL_ROOT_PASSWORD: "secret" },
      },
      "shop-shop-db",
    );

    expect(env).toEqual({
      MYSQL_HOST: "shop-shop-db",
      MYSQL_ROOT_PASSWORD: "secret",
    });
  });

  test("buildServiceDbEnv maps postgres connection vars", () => {
    const env = buildServiceDbEnv(
      "app-db",
      { engine: "postgres" },
      "dev-app-db",
    );

    expect(env.PGHOST).toBe("dev-app-db");
    expect(env.PGPORT).toBe("5432");
    expect(env.DATABASE_URL).toContain(
      "postgresql://postgres:postgres@dev-app-db:5432/app",
    );
  });

  test("resolveDbEngine rejects unknown engines", () => {
    expect(() => resolveDbEngine({ engine: "mongo" }, "x")).toThrow(
      /Unsupported database engine/,
    );
  });

  test("defaultDbChartPath points at bundled helm chart", () => {
    expect(defaultDbChartPath()).toBe(
      path.join(paths.REPO_ROOT, "helm-charts", "db"),
    );
  });
});
