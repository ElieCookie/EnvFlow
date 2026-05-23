# go-api — Go HTTP demo

Go server-side example. DevSpace syncs source changes and restarts `go run .` on watch.

## Run

```bash
minikube start
cd examples/go-api
npx @envflow/sun-cli ctx create --name demo --yes
# or from a checkout:
node ../../bin/sun.js ctx create --name demo --yes
```

Expected:

1. Helm chart applied (`demo-go-api` Deployment + Service).
2. DevSpace syncs `./app` into the pod.
3. `go run .` serves HTTP on port 8080.

```bash
curl http://localhost:8080
curl http://localhost:8080/health
```

## Live reload demo

Edit `app/main.go` (change the `"lang"` field or add a handler). Save the file; DevSpace re-syncs and re-runs the dev command. Re-run `curl http://localhost:8080` to see the change.

## Tear down

```bash
node ../../bin/sun.js ctx delete --name demo --yes
```
