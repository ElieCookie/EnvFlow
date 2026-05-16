# ☀️ Sun CLI (EnvFlow)

Generic platform CLI for EnvFlow: **rise** (setup), **doctor** (checks), and **ctx** (`create` / `ls`). Targets **minikube** by default. AWS/EKS path lives behind `--with-aws` for later.

The **Chrome "debug header" extension** lives at **`debug-header-extension/`**. It is **not** a `sun` subcommand; load it unpacked from `chrome://extensions`, as in that folder's README. Update client domains in the permitted hosts list in `debug-header-extension/manifest.json`.

## Quick start (minikube)

```bash
minikube start
cd examples/hello-api
npx @envflow/sun-cli ctx create --name demo --yes
# devspace attaches; localhost:8080 lights up
curl http://localhost:8080
```

That's the whole loop: chart applied → pod up → file sync → dev command runs.

## Run from a checkout

```bash
cd /path/to/EnvFlow
npm install
node bin/sun.js rise
node bin/sun.js doctor
node bin/sun.js ctx create
```

Or link the binary so `sun` is on your PATH:

```bash
npm link
sun rise
sun doctor
sun ctx create
```

## Commands

### `sun rise`

Initial setup:

- Installs required tools via Homebrew (DevSpace, kubectl, minikube, optionally AWS CLI with `--with-aws`).
- Creates `~/envflow` (clone target) and `~/.envflow-ephemeral` (generated configs + chart cache).
- Optionally clones service repos listed in `.sunrc` when `org:` (or `ENVFLOW_GITHUB_ORG`) is set.

### `sun doctor`

Verifies tools, kubectl/minikube reachability, and the ephemeral dir layout. Lists existing contexts.

### `sun ctx create`

Reads `.sunrc`, writes `~/.envflow-ephemeral/devspace-<env>.yaml`, then runs `devspace dev` against the chosen namespace. Per-service Helm chart support; see Chart spec below.

```bash
sun ctx create                           # interactive
sun ctx create --name dev-a --yes        # non-interactive, watch all services
sun ctx create --name dev-a --no-deploy  # write config, skip devspace dev
sun ctx create --cluster minikube --yes  # target an explicit kubectl context
```

Outputs:

- `~/.envflow-ephemeral/devspace-<env>.yaml`

### `sun ctx ls`

Lists saved contexts.

## `.sunrc` shape

```yaml
org: your-github-org   # optional, used by `sun rise` clones

services:
  example-api:
    repo: example-backend     # local code dir (see resolution rules)
    port: 8080
    image: node:20-alpine
    workingDir: /usr/src/app
    install: npm install
    command: npm run dev
    chart: ./helm/example-api # per-service chart
    values:
      replicas: 1
      env: { LOG_LEVEL: debug }
```

### `repo` resolution

1. Absolute path → used as-is.
2. Path relative to the `.sunrc` directory → used if it exists on disk.
3. Fallback: `~/envflow/<repo>` (what `sun rise` clones into).

### Chart spec — three forms

```yaml
# 1. Local path (relative to .sunrc, or absolute)
chart: ./helm/example-api

# 2. Whole git repo as the chart
chart: git@github.com:your-org/helm-charts.git

# 3. Subpath inside a git repo, pinned to a ref
chart:
  git: git@github.com:your-org/helm-charts.git
  path: charts/example-api
  ref: main
```

Git charts are shallow-cloned into `~/.envflow-ephemeral/chart-cache/<sha>/` and reused. When no `chart:` is set, sun falls back to its bundled default chart shipped at `src/builtin-charts/default-service/`.

## AWS / EKS (later)

```bash
sun rise --with-aws
sun doctor --with-aws
sun ctx create --cluster my-eks-dev --yes
```

`rise` does **not** run `aws sso login`; it only ensures the AWS CLI is present when you pass `--with-aws`. `ctx create --cluster <name>` targets any kubectl context — same flow against minikube, EKS, GKE.

## Browser extension (`debug-header-extension`)

See **`debug-header-extension/README.md`**. From Node, the path helper is **`require('./src/browser-extension/paths').debugHeaderExtensionDir()`** (for tooling; the CLI does not install the extension).

## Install from npm (optional)

```bash
npm install -g @envflow/sun-cli
sun rise
sun ctx create
```

`npx @envflow/sun-cli ctx create` also works without a global install. The bundled default chart ships inside the package — no separate clone needed.

## Architecture

```
~/envflow/                 # cloned service repos (from .sunrc)
~/.envflow-ephemeral/
├── chart-cache/<sha>/     # shallow-cloned git charts
└── devspace-<env>.yaml    # generated per ctx
```

## License

MIT © EnvFlow
