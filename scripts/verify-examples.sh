#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUN=(node "${ROOT}/bin/sun.js")
EPHEMERAL="${HOME}/.envflow-ephemeral"
TIMEOUT=300
DEVSPACE_PID=""

cleanup_devspace() {
  if [[ -n "${DEVSPACE_PID}" ]] && kill -0 "${DEVSPACE_PID}" 2>/dev/null; then
    kill "${DEVSPACE_PID}" 2>/dev/null || true
    wait "${DEVSPACE_PID}" 2>/dev/null || true
  fi
  DEVSPACE_PID=""
}

delete_ctx() {
  local name="$1"
  cleanup_devspace
  "${SUN[@]}" ctx delete --name "${name}" --yes 2>/dev/null || true
  kubectl delete ns "devspace-${name}" --ignore-not-found --wait=false 2>/dev/null || true
}

wait_for_url() {
  local url="$1"
  local label="$2"
  local elapsed=0
  while (( elapsed < TIMEOUT )); do
    if curl -sf "${url}" >/dev/null 2>&1; then
      echo "  OK ${label}: ${url}"
      curl -sf "${url}"
      echo
      return 0
    fi
    sleep 5
    elapsed=$((elapsed + 5))
    echo "  ... waiting for ${label} (${elapsed}s)"
  done
  echo "  FAIL ${label}: timed out after ${TIMEOUT}s"
  return 1
}

run_example() {
  local dir="$1"
  local env_name="$2"
  shift 2
  local timeout="${TIMEOUT}"
  local last="${!#}"
  local urls
  if [[ "${last}" =~ ^[0-9]+$ ]]; then
    timeout="${last}"
    urls=("${@:1:$#-1}")
  else
    urls=("$@")
  fi
  local saved_timeout="${TIMEOUT}"
  TIMEOUT="${timeout}"

  echo
  echo "========================================"
  echo "Example: ${dir} (env=${env_name})"
  echo "========================================"

  delete_ctx "${env_name}"

  cd "${ROOT}/examples/${dir}"

  # Write config and start devspace in background
  "${SUN[@]}" ctx create --name "${env_name}" --yes --no-deploy

  local config="${EPHEMERAL}/devspace-${env_name}.yaml"
  local ns="devspace-${env_name}"

  devspace dev --config "${config}" --namespace "${ns}" &
  DEVSPACE_PID=$!

  local failed=0
  for url in "${urls[@]}"; do
    wait_for_url "${url}" "${dir}" || failed=1
  done

  delete_ctx "${env_name}"

  TIMEOUT="${saved_timeout}"
  if (( failed )); then
    echo "RESULT: FAIL ${dir}"
    return 1
  fi
  echo "RESULT: PASS ${dir}"
}

trap cleanup_devspace EXIT

echo "Prerequisites"
kubectl config current-context
minikube status | head -3

# shopping-list clone
"${ROOT}/examples/shopping-list/setup.sh"

run_example "hello-api" "demo" "http://localhost:8080"
run_example "python-api" "demo" "http://localhost:8080/health"
run_example "go-api" "demo" "http://localhost:8080/health"
run_example "shopping-list" "shop" \
  "http://localhost:3000/livez" \
  "http://localhost:8080" \
  600

echo
echo "All examples passed."
