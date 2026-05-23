# Local Development Guide

This document is for contributors and coding agents working on EnvFlow from a local checkout. The main `README.md` describes the project surface; this file describes how to run, test, and change it safely.

## Repository Shape

EnvFlow is a Node.js CLI package. The executable entrypoint is `bin/sun.js`; command implementations live under `src/commands`; reusable helpers live under `src/utils` or command-local helper modules.

Important paths:

- `bin/sun.js`: CLI registration and top-level command wiring.
- `src/commands/rise.js`: local setup and optional repository cloning.
- `src/commands/doctor.js`: environment diagnostics.
- `src/commands/ctx/`: context create/list/delete behavior.
- `src/utils/`: shared utility modules.
- `debug-header-extension/`: Chrome MV3 extension, not a CLI command.
- `tests/unit/`: pure helper and module-level tests.
- `tests/integration/`: CLI flows that execute `bin/sun.js`.
- `tests/drivers/`: test drivers for filesystem setup, fake binaries, and CLI execution.

Generated local state is written outside the repository:

```text
~/envflow/                 # cloned service repositories from .sunrc
~/.envflow-ephemeral/      # generated DevSpace configs and chart cache
```

Do not commit generated local state, cloned service repositories, or `node_modules`.

## Setup

From the repository root:

```bash
npm install
```

The project requires Node.js 18 or newer. The CLI also relies on external tools for real local flows: `kubectl`, `minikube`, `devspace`, `git`, and optionally `aws`.

## Running the CLI Locally

Run directly from the checkout:

```bash
node bin/sun.js --help
node bin/sun.js doctor
node bin/sun.js ctx ls
```

Use `npm link` when you need to test the installed binary shape:

```bash
npm link
sun --help
sun doctor
sun ctx ls
```

If the global `sun` command behaves differently from `node bin/sun.js`, check that the linked package points to the current checkout.

## Example Minikube Flows

Use the bundled examples to verify the happy path. See [examples/README.md](examples/README.md) for all demos.

Minimal smoke test:

```bash
minikube start
cd examples/hello-api
node ../../bin/sun.js ctx create --name demo --yes
```

`ctx create` writes `~/.envflow-ephemeral/devspace-demo.yaml` and starts `devspace dev` in namespace `devspace-demo`. The example service should be reachable through the forwarded port:

```bash
curl http://localhost:8080
```

To inspect or remove the context:

```bash
node ../../bin/sun.js ctx ls
node ../../bin/sun.js ctx delete --name demo --yes
```

## Kubernetes Context Behavior

EnvFlow is intentionally generic. Commands must not hardcode cloud accounts, regions, cluster ARNs, or provider-specific context names.

Default behavior expects the current kubectl context to be `minikube`. For any other cluster, pass the expected context explicitly:

```bash
sun ctx create --cluster my-dev-cluster --name demo --yes
sun ctx delete --cluster my-dev-cluster --name demo --yes
```

The `--cluster` option validates the active kubeconfig context. It does not switch contexts.

## Test Commands

Run unit tests only:

```bash
npm run test:unit
```

Run integration tests only:

```bash
npm run test:integration
```

Run the full suite:

```bash
npm test
```

Current test layout:

- Unit tests cover pure helpers and small modules.
- Integration tests execute `bin/sun.js` with temporary homes, fake `kubectl`, and fake `devspace`.
- Drivers own setup and technical scaffolding; spec files should contain scenario intent and assertions.

## Testing Guidelines

Use driver-based tests. New test setup should go in `tests/drivers`, not inline in specs.

Prefer unit tests for:

- Option resolution.
- Path resolution.
- Context discovery and summaries.
- File cleanup helpers.
- Pure browser extension helpers.
- DevSpace config generation.

Prefer integration tests for:

- CLI argument wiring.
- End-to-end command behavior.
- Process exit behavior.
- Files written by `bin/sun.js`.
- Calls to external tools, represented by fake binaries.

Avoid real external dependencies in tests. Do not require a real Kubernetes cluster, DevSpace installation, Chrome runtime, AWS account, or network access.

## Implementation Guidelines

Keep command handlers thin. Command files should orchestrate input, output, and process exits. Reusable logic should live in small helper modules.

When changing `ctx` behavior:

- Keep namespace derivation as `devspace-<env>`.
- Keep generated config names as `devspace-<env>.yaml`.
- Use `paths.ephemeralDir()` instead of hardcoded home paths.
- Use `ensureClusterContext` for kube context validation.
- Add unit tests for helper behavior and integration tests for command wiring.

When adding interactive prompts, import `prompt` from `src/utils/prompt.js`. The wrapper handles the installed `inquirer` package shape.

When changing the Chrome extension, keep browser-only startup guarded so Jest can import pure helpers without a Chrome runtime.

## Debug Header Extension

The extension lives in `debug-header-extension/` and is loaded manually through Chrome or Arc as an unpacked extension. It is not installed by the CLI.

For extension changes:

- Keep Manifest V3 compatibility.
- Keep `X-Debug` header behavior explicit.
- Update `debug-header-extension/README.md` for browser-specific usage.
- Add tests for pure helpers under `tests/unit`.

## Common Issues

If `sun ctx delete` or `sun ctx create` fails with an inquirer prompt error, use the local `src/utils/prompt.js` wrapper instead of importing `inquirer` directly.

If `ctx create` reports the wrong cluster, check:

```bash
kubectl config current-context
```

For non-minikube clusters, pass `--cluster <current-context>`.

If integration tests fail because a real tool is being called, add or fix a fake binary in the relevant test driver instead of depending on the host machine.
