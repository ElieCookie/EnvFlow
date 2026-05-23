# python-api — FastAPI demo

Python server-side example with live reload via Uvicorn.

## Run

```bash
minikube start
cd examples/python-api
npx @envflow/sun-cli ctx create --name demo --yes
# or from a checkout:
node ../../bin/sun.js ctx create --name demo --yes
```

Expected:

1. Helm chart applied (`demo-python-api` Deployment + Service).
2. DevSpace syncs `./app` into the pod.
3. Uvicorn starts with `--reload` on port 8080.

```bash
curl http://localhost:8080
curl http://localhost:8080/health
```

## Live reload demo

Edit `app/main.py` (change the `"hello"` field or add a route). DevSpace syncs the file; Uvicorn reloads automatically. Re-run `curl http://localhost:8080` to see the change.

## Tear down

```bash
node ../../bin/sun.js ctx delete --name demo --yes
```
