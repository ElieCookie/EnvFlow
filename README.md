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

## License

MIT © EnvFlow
