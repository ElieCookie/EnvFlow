# EnvFlow demo examples

Runnable examples for live demos with `sun rise`, `sun doctor`, and `sun ctx create`. Each example syncs local source into minikube and re-runs the dev command so edits show up without a full redeploy.

| Example                          | Stack                | Port(s)    | What it shows                       |
| -------------------------------- | -------------------- | ---------- | ----------------------------------- |
| [hello-api](./hello-api)         | Node.js              | 8080       | Minimal smoke test                  |
| [python-api](./python-api)       | Python / FastAPI     | 8080       | Server-side Python + Uvicorn reload |
| [go-api](./go-api)               | Go                   | 8080       | Server-side Go                      |
| [shopping-list](./shopping-list) | NestJS + Vue + MySQL | 3000, 8080 | Full-stack app from GitHub          |

## Common demo flow

```bash
# once per machine
minikube start
npm install -g @envflow/sun-cli   # or use npx / node ../../bin/sun.js
sun rise
sun doctor

# pick an example
cd examples/<example>
sun ctx create --name demo --yes    # shopping-list: --name shop

# verify (ports vary by example)
curl http://localhost:8080

# tear down
sun ctx delete --name demo --yes
```

See each example's README for ports, curl commands, and live-reload steps.
