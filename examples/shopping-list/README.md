# shopping-list — NestJS + Vue full-stack demo

Full-stack demo using [ElieCookie/ShoppingList](https://github.com/ElieCookie/ShoppingList): NestJS API, Vue UI, and MySQL.

## Prerequisites

- minikube, kubectl, devspace (installed via `sun rise`)
- Git access to clone the ShoppingList repo

## Run

```bash
minikube start
cd examples/shopping-list
./setup.sh
npx @envflow/sun-cli ctx create --name shop --yes
# or from a checkout:
node ../../bin/sun.js ctx create --name shop --yes
```

Use `--name shop` so the API reaches MySQL at the `shop-shop-db` service (from `databases.shop-db`).

The `databases` block deploys MySQL via the bundled `helm-charts/db` chart (real `mysqld`, not a sleep container). The API links with `db: shop-db`, which injects `MYSQL_HOST` and `MYSQL_ROOT_PASSWORD`.

Expected:

1. MySQL deploys as `shop-shop-db` from the `databases` section (port-forward only, no file sync).
2. API and UI charts deploy; DevSpace syncs cloned source from `repos/ShoppingList/`.
3. NestJS runs `npm run start:dev` on port 3000.
4. Vite runs on port 8080 and proxies `/api/*` to the API.

```bash
# API (direct)
curl http://localhost:3000/items
curl http://localhost:3000/livez

# UI (browser or curl)
open http://localhost:8080
```

## Live reload demo

**Backend:** edit a file under `repos/ShoppingList/api/src/` — NestJS watch mode picks up the change.

**Frontend:** edit a Vue file under `repos/ShoppingList/ui/src/` — Vite hot-reloads in the browser.

**End-to-end:** add an item in the UI or via curl:

```bash
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"task": "Demo groceries"}'
```

Refresh the UI to see the new item.

## Tear down

```bash
node ../../bin/sun.js ctx delete --name shop --yes
```

## Source repo

Clone target: `repos/ShoppingList` (gitignored). Re-run `./setup.sh` to refresh from GitHub.
