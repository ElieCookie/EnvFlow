# lenv-cli

Generic CLI for dev environment orchestration. Config-driven tool checks, installs, and kubectl context management. No domain assumptions — works for any org or project.

## Install

```bash
npm install -g lenv-cli
# or
yarn global add lenv-cli
```

## Quick start (minikube — local k8s, no cloud)

1. Drop `lenv.config.yaml` in your project root:

```yaml
tools:
  - name: git
  - name: kubectl
    install: brew install kubectl
  - name: minikube
    check: minikube version --short
    install: brew install minikube
  - name: helm
    install: brew install helm
  - name: docker
    install: brew install --cask docker

kube:
  name: minikube
  namespace: default
```

2. Bring up local cluster + tools:

```bash
lenv doctor                 # check tools present
lenv rise                   # install missing
minikube start              # boot local k8s (one-time per session)
lenv rise                   # re-run: switches kubectl ctx to minikube
kubectl get nodes           # verify
```

Same config swaps to EKS/GKE/AKS by changing `kube.name` to your cluster's kubectl context — no other code change.

## Commands

| Command | Purpose | Side effects |
|---|---|---|
| `lenv help` | Print command list | none |
| `lenv doctor` | Verify tools from config exist | read-only |
| `lenv rise` | Install missing tools, apply kube context | runs install shell commands, switches `kubectl` context |

Exit codes: `0` = OK, `1` = missing config / required tool missing / install failed / unknown command.

## Config

Loaded from first existing file in cwd:

1. `lenv.config.js`
2. `lenv.config.yaml`
3. `lenv.config.yml`
4. `.lenvrc.yaml`

### `tools[]`

| Field | Type | Default | Purpose |
|---|---|---|---|
| `name` | string | required | Binary name. Used as PATH check if `check` omitted. |
| `check` | string | `command -v <name>` | Shell command. Exit 0 = tool present. |
| `install` | string | — | Shell command run by `rise` if tool missing. |
| `optional` | bool | `false` | `doctor` reports SKIP not MISSING; `rise` skips when no `install`. |

### `kube{}`

| Field | Applied by `rise` |
|---|---|
| `name` | `kubectl config use-context <name>` |
| `namespace` | `kubectl config set-context --current --namespace=<ns>` |

## Examples

### Minimal check

```yaml
tools:
  - name: docker
  - name: git
```

```bash
$ lenv doctor
Config: ./lenv.config.yaml
OK      docker         found in PATH
OK      git            found in PATH

All required tools present
```

### Full setup with install + kube

```yaml
tools:
  - name: kubectl
    install: brew install kubectl
  - name: helm
    install: brew install helm
  - name: aws
    check: aws --version
    install: brew install awscli

kube:
  name: dev-cluster
  namespace: my-team
```

```bash
$ lenv rise
Config: ./lenv.config.yaml
= kubectl already installed
> installing helm: brew install helm
+ helm installed
= aws already installed
> kubectl config use-context dev-cluster
Switched to context "dev-cluster".
> kubectl set namespace my-team
Context "dev-cluster" modified.

installed: 1, failed: 0
```

### JS config (dynamic)

```js
// lenv.config.js
const fromEnv = process.env.K8S_CTX || 'docker-desktop';

module.exports = {
  tools: [
    { name: 'kubectl', install: 'brew install kubectl' },
  ],
  kube: { name: fromEnv, namespace: 'dev' },
};
```

## Project structure

```
lenv-cli/
├── bin/lenv.js              # entry, shebang
├── src/
│   ├── commands/
│   │   ├── index.js         # registry + help
│   │   ├── doctor.js
│   │   └── rise.js
│   └── utils/
│       ├── exec.js          # run / which / spawnInherit
│       └── cliConfig.js     # config loader
└── package.json
```

Plain JavaScript. No build step. Runs on Node 14+.

## Local development

```bash
git clone <repo>
cd lenv-cli
yarn install            # installs only `yaml` runtime dep + semantic-release devDeps

# run from source
node bin/lenv.js doctor

# or link globally
npm link
lenv doctor
```

Edit `src/**`, rerun. No build, no watch, no compile.

## Adding a command

1. Create `src/commands/<name>.js`:

```js
const handler = async args => {
  // do work
  return 0; // exit code
};

const myCommand = {
  name: 'mycommand',
  description: 'What it does',
  handler,
};

module.exports = { myCommand };
```

2. Register in `src/commands/index.js`:

```js
const { myCommand } = require('./mycommand');

const commands = {
  doctor: doctorCommand,
  rise: riseCommand,
  mycommand: myCommand,
};
```

That's it. `lenv mycommand` is live.

## License

MIT
