# ☀️ Sun CLI (EnvFlow)

Generic platform CLI for EnvFlow: **rise** (setup), **doctor** (checks), and **ctx** (`create` / `ls` / `delete`). Targets **minikube** by default and can target any Kubernetes context configured in kubeconfig.

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

- Checks required tools and installs missing supported tools when possible: kubectl and minikube via Homebrew, DevSpace via its release binary, and AWS CLI via Homebrew when `--with-aws` is used.
- Creates `~/envflow` (clone target) and `~/.envflow-ephemeral` (generated configs + chart cache).
- Optionally clones service repos listed in `.sunrc` when `org:` (or `ENVFLOW_GITHUB_ORG`) is set.

### `sun doctor`

Verifies tools, kubectl/minikube reachability, and the ephemeral dir layout. Lists existing contexts.

### `sun ctx create`

Reads `.sunrc`, writes `~/.envflow-ephemeral/devspace-<env>.yaml`, then runs `devspace dev` against the chosen namespace. Per-service Helm chart support; see Chart spec below.

```bash
sun ctx create                           # interactive
sun ctx create --name dev-a --yes        # non-interactive, watch all services
sun ctx create --name dev-a --services api,web --watch api
sun ctx create --name dev-a --no-deploy  # write config, skip devspace dev
sun ctx create --cluster minikube --yes  # target an explicit kubectl context
```

Outputs:

- `~/.envflow-ephemeral/devspace-<env>.yaml`

### `sun ctx ls`

Lists saved contexts.

### `sun ctx delete`

Deletes a saved context, removes its `devspace-<env>` namespace, and removes local generated context files.

```bash
sun ctx delete                    # interactive
sun ctx delete --name dev-a --yes # non-interactive
sun ctx delete --cluster minikube # target an explicit kubectl context
```

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

Git charts are shallow-cloned into `~/.envflow-ephemeral/chart-cache/<sha>/` and reused. `chart:` is **required** per service — there is no bundled default. Point it at a local path or a chart repo you control.

## AWS / EKS (later)

```bash
sun rise --with-aws
sun doctor --with-aws
sun ctx create --cluster my-eks-dev --yes
sun ctx delete --cluster my-eks-dev
```

`--cluster <name>` targets the active kubectl context by name. The same context workflow works with minikube, EKS, GKE, or any Kubernetes cluster configured in kubeconfig.

## Browser extension (`debug-header-extension`)

The Chrome debug header extension lives in `debug-header-extension/`. It is not a `sun` subcommand; load it unpacked from `chrome://extensions`, as described in `debug-header-extension/README.md`.

From Node, the path helper is `require('./src/browser-extension/paths').debugHeaderExtensionDir()` for tooling.

## Install from npm (optional)

```bash
npm install -g @envflow/sun-cli
sun rise
sun ctx create
```

`npx @envflow/sun-cli ctx create` also works without a global install. Each service in your `.sunrc` must declare its own `chart:`.

## Architecture

```
~/envflow/                 # cloned service repos (from .sunrc)
~/.envflow-ephemeral/
├── chart-cache/<sha>/     # shallow-cloned git charts
└── devspace-<env>.yaml    # generated per ctx
```

## License

MIT © EnvFlow
