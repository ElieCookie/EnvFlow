# ☀️ Sun CLI

Platform Infrastructure Management Tool for EnvFlow.

## Installation

### Configure npm for GitHub Packages
```bash
npm config set @envflow:registry https://npm.pkg.github.com
```

Add your GitHub token to `~/.npmrc`:
```bash
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc
```
> You need a GitHub Personal Access Token with `read:packages` scope.

### Install the CLI
```bash
npm install -g @envflow/sun-cli
```

After installation, run rise to configure your environment:
```bash
sun rise
```

## Commands

### `sun rise`
Complete environment setup:
- Installs required tools (DevSpace, AWS CLI, kubectl) via Homebrew
- Configures AWS credentials with SSO login
- Sets up kubectl context for EKS cluster
- Clones all service repositories from `.sunrc`
- Creates directory structure

### `sun doctor`
Checks system health:
- Verifies required tools are installed
- Validates AWS credentials and Kubernetes context
- Checks directory structure and helm-charts repo

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

```
~/envflow/                   # Cloned repositories
├── player-backend/
├── player-frontend/
└── core/

~/.envflow-ephemeral/        # DevSpace configs
├── helm-charts/             # Service route charts
├── devspace-[env].yaml      # Environment config
└── [env].yaml               # Helm values
```

## License

MIT © EnvFlow
