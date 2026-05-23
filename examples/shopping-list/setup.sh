#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="${ROOT}/repos/ShoppingList"

if [[ ! -d "${REPO}/.git" ]]; then
  echo "Cloning ElieCookie/ShoppingList into ${REPO}"
  git clone https://github.com/ElieCookie/ShoppingList.git "${REPO}"
else
  echo "Updating ${REPO}"
  git -C "${REPO}" pull --ff-only
fi

echo "Ready. Next:"
echo "  minikube start"
echo "  cd ${ROOT}"
echo "  npx @envflow/sun-cli ctx create --name shop --yes"
