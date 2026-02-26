#!/bin/bash
set -euo pipefail

SERVER="${DEPLOY_HOST:?Set DEPLOY_HOST env var, e.g. root@your-server-ip}"
REMOTE_DIR="${DEPLOY_DIR:-/opt/mydeadprojects}"

echo "==> Syncing files to server..."
rsync -az --delete --checksum \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='.env*.local' \
  --exclude='.env' \
  "$(dirname "$0")/" \
  "$SERVER:$REMOTE_DIR/"

echo "==> Building and starting containers..."
ssh "$SERVER" "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml up -d --build --remove-orphans"

echo "==> Done! Checking status..."
ssh "$SERVER" "docker compose -f $REMOTE_DIR/docker-compose.prod.yml ps"
