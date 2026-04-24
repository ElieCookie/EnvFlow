# ☀️ Sun CLI (EnvFlow)

Generic platform CLI for EnvFlow: **rise** (setup) and **doctor** (checks). currently targets **minikube** and a **helm-charts** directory inside this repo (no AWS SSO in the default path).

The **Chrome “debug header” extension** lives at **`debug-header-extension/`**. It is **not** a `sun` subcommand; load it unpacked from `chrome://extensions`, as in that folder’s README.
Update client domain in the permited hosts in the debug header manifest.

## Run from this repository (recommended for development)

```bash
cd /path/to/EnvFlow
npm install
node bin/sun.js rise
node bin/sun.js doctor
```

Same without a global `sun` install:

```bash
npm run sun -- rise
npm run sun -- doctor
```

Or link the binary (then `sun` is on your PATH):

```bash
cd /path/to/EnvFlow
npm install
npm link
sun rise
sun doctor
```

## Commands

### `sun rise`

Complete environment setup:

- Installs required tools (DevSpace, AWS CLI, kubectl) via Homebrew
- Configures AWS credentials with SSO login (later)
- Sets up kubectl context for EKS cluster (later)
- Clones all service repositories from `.sunrc`
- Creates directory structure

### `sun doctor`

Checks system health:

- Verifies required tools are installed
- Validates AWS credentials and Kubernetes context (later)
- Checks directory structure and helm-charts in repo

## Minikube flow (no AWS login)

1. Install [minikube](https://minikube.sigs.k8s.io/docs/start/), kubectl, DevSpace, and Git (Homebrew is fine on macOS).
2. `minikube start`
3. From the EnvFlow repo: `sun rise` — installs/checks tools, creates `~/envflow` and `~/.envflow-ephemeral`, symlinks **`./helm-charts` → `~/.envflow-ephemeral/helm-charts`**, optionally clones repos from `.sunrc`.
4. `sun doctor` — verifies tools, minikube/kubectl reachability, and the helm layout.

Optional clones: copy `.sunrc.example` to `.sunrc`, set `org:` and `repo` fields, then re-run `sun rise`. Use `ENVFLOW_GITHUB_ORG` or `ENVFLOW_GIT_CLONE_HTTPS=1` if you prefer HTTPS clones.

## AWS / EKS (later)

```bash
sun rise --with-aws
sun doctor --with-aws
```

`rise` does **not** run `aws sso login`; it only ensures the AWS CLI is present when you pass `--with-aws`.

## Helm charts

Charts live under **`helm-charts/` in this repo`**. After `sun rise`, DevSpace and other tooling can keep using `~/.envflow-ephemeral/helm-charts` as a stable path while you edit charts in the git tree.

## Browser extension (`debug-header-extension`)

See **`debug-header-extension/README.md`**. From Node, the path helper is **`require('./src/browser-extension/paths').debugHeaderExtensionDir()`** (for tooling; the CLI does not install the extension).

## Install from GitHub Packages (optional)

```bash
npm config set @envflow:registry https://npm.pkg.github.com
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc
npm install -g @envflow/sun-cli
sun rise
```

Global install runs `postinstall`, which clones this repo to `~/envflow/sun-cli` when missing; for active development, prefer working directly in your EnvFlow clone as above.

## Configuration

The `.sunrc` file defines your services. It is automatically available at `~/envflow/sun-cli/.sunrc` after installation.

```yaml
services:
  player-api:
    envfile: .env.devspace
    port: 8080
    host: "api.dev.example.com"
    repo: "player-backend"
    command: "yarn start:dev"
    chart: "player-api"
    secret-name: "eks/development/external-secret"
```

## Architecture

~/envflow/ # Cloned repositories
├── player-backend/
├── player-frontend/
└── core/

~/.envflow-ephemeral/ # DevSpace configs
├── helm-charts/ # Service route charts
├── devspace-[env].yaml # Environment config
└── [env].yaml # Helm values

## License

MIT © EnvFlow
