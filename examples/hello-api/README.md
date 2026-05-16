# hello-api — sun ctx create demo

End-to-end smoke for `sun ctx create` against minikube.

## Layout

- `app/server.js` — 30-line Node HTTP server, port 8080
- `chart/` — minimal Helm chart (Deployment + ClusterIP Service)
- `.sunrc` — single service entry pointing at `./chart`

## Run

```bash
# from this directory
minikube start
npx @envflow/sun-cli ctx create --name demo --yes
# or, from a checkout:
node ../../bin/sun.js ctx create --name demo --yes
```

Expected:

1. Helm chart applied (Deployment + Service named `demo-hello-api`).
2. DevSpace syncs `./app` into the pod at `/usr/src/app`.
3. Container runs `node server.js`.
4. `localhost:8080` reachable via DevSpace port-forward.

```bash
curl http://localhost:8080
# {"hello":"envflow",...}
```

Tear down:

```bash
helm uninstall hello-api -n devspace-demo
kubectl delete ns devspace-demo
```
