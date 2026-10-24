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

# Keep this script itself up to date: if GitHub has a newer version of it,
# install that and re-run, so deploy changes never need a manual step.
SELF=/usr/local/bin/deploy-sylp
if NEW=$(g show "origin/$BRANCH:deploy/deploy-sylp.sh" 2>/dev/null) && [[ "$NEW" != "$(cat "$SELF")" ]]; then
  echo "Updating deploy script from GitHub"
  printf '%s\n' "$NEW" > "$SELF.new" && chmod 755 "$SELF.new" && mv "$SELF.new" "$SELF"
  flock -u 9
  exec "$SELF" "$@"
fi

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
  # npm ci deletes the generated Prisma Client.  Always regenerate it
  # for the restored revision or the rollback itself returns HTTP 500.
  # The service environment may set NODE_ENV=production: without an
  # explicit include npm omits build-time devDependencies on rollback.
  npm ci --include=dev --no-audit --no-fund --silent || true
  npx prisma generate --no-hints || echo "WARNING: Prisma Client regeneration failed during rollback"
  chown -R sylp:sylp .next
  systemctl restart "$SERVICE"
  exit 1
}
trap rollback ERR

g reset -q --hard "$LATEST"

set -a; . "$ENV_FILE"; set +a
# A live server may have NODE_ENV=production, which makes plain npm ci
# omit build-time devDependencies such as @tailwindcss/postcss.  Also, an
# existing node_modules directory is not evidence that these are installed.
# Always start a new deployment with a reproducible, complete build toolchain.
# We need the dev dependencies to BUILD, not to run the production server.
npm ci --include=dev --no-audit --no-fund --silent
node -e "require.resolve('@tailwindcss/postcss')"
node -e "require.resolve('prisma')"
# Apply new database changes (e.g. new tables) before building.
if ! g diff --quiet "$CURRENT" "$LATEST" -- prisma/migrations prisma/schema.prisma || [[ "${1:-}" == "--migrate" ]]; then
  echo "Applying database migrations"
  npx prisma migrate deploy
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
