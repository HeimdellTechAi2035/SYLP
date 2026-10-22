#!/usr/bin/env bash
# Pulls the latest `main` from GitHub, rebuilds and restarts the shop.
# Run by the sylp-deploy.timer every 2 minutes; does nothing if GitHub
# hasn't changed. If the build or health check fails, it rolls back to
# the previous working version so the live site never stays broken.
set -euo pipefail

APP_DIR=/var/www/sylp/app
BRANCH=main
ENV_FILE=/etc/sylp/env
SERVICE=sylp
HEALTH_URL=http://127.0.0.1:3010/

exec 9>/run/sylp-deploy.lock
flock -n 9 || { echo "Deploy already running, skipping."; exit 0; }

cd "$APP_DIR"
g() { git -c safe.directory="$APP_DIR" "$@"; }

g fetch -q origin "$BRANCH"
CURRENT=$(g rev-parse HEAD)
LATEST=$(g rev-parse "origin/$BRANCH")

if [[ "$CURRENT" == "$LATEST" && "${1:-}" != "--force" ]]; then
  exit 0
fi

echo "Deploying $LATEST (was $CURRENT)"

# Keep the working build so we can put it back if anything fails.
rm -rf .next.prev
[[ -d .next ]] && cp -a .next .next.prev

rollback() {
  echo "Deploy FAILED - rolling back to $CURRENT"
  g reset -q --hard "$CURRENT"
  if [[ -d .next.prev ]]; then rm -rf .next && mv .next.prev .next; fi
  npm ci --no-audit --no-fund --silent || true
  chown -R sylp:sylp .next
  systemctl restart "$SERVICE"
  exit 1
}
trap rollback ERR

g reset -q --hard "$LATEST"

set -a; . "$ENV_FILE"; set +a
# Only reinstall packages when they actually changed - keeps deploys quick.
if [[ ! -d node_modules ]] || ! g diff --quiet "$CURRENT" "$LATEST" -- package.json package-lock.json; then
  npm ci --no-audit --no-fund --silent
fi
npm run build

chown -R sylp:sylp .next
systemctl restart "$SERVICE"

# Give it a moment to start, then make sure it actually serves pages.
for i in $(seq 1 20); do
  sleep 3
  if curl -fsS -o /dev/null "$HEALTH_URL"; then
    trap - ERR
    rm -rf .next.prev
    echo "Deploy OK: $LATEST"
    exit 0
  fi
done

echo "Site did not come back after restart."
false
