#!/usr/bin/env bash
# One-time setup, run as root on the VPS:
#   curl -fsSL https://raw.githubusercontent.com/HeimdellTechAi2035/SYLP/main/deploy/setup-autodeploy.sh | bash
#
# 1. Checks the live code matches GitHub (ignoring Windows line endings)
#    and stops without changing anything if it doesn't.
# 2. Links /var/www/sylp/app to the GitHub repo.
# 3. Installs a timer that deploys new commits on `main` every 2 minutes.
# 4. Runs the first deploy straight away.
set -euo pipefail

REPO=https://github.com/HeimdellTechAi2035/SYLP.git
RAW=https://raw.githubusercontent.com/HeimdellTechAi2035/SYLP/main/deploy
APP_DIR=/var/www/sylp/app
CHECK_DIR=$(mktemp -d)

[[ $EUID -eq 0 ]] || { echo "Run this as root."; exit 1; }

echo "==> Backing up the live site to /root/sylp-site.pre-autodeploy"
rm -rf /root/sylp-site.pre-autodeploy
cp -a "$APP_DIR" /root/sylp-site.pre-autodeploy

echo "==> Checking the live code matches GitHub"
git clone -q "$REPO" "$CHECK_DIR"
DIFFS=$(diff -rq --strip-trailing-cr \
  --exclude=node_modules --exclude=.next --exclude=.next.prev --exclude=.git \
  --exclude=.netlify --exclude=next-env.d.ts --exclude=.env.example --exclude=.env.test \
  --exclude=CLAUDE.md --exclude=AGENTS.md \
  --exclude=deploy \
  "$CHECK_DIR" "$APP_DIR" || true)

# Files the rename on GitHub is expected to change.
EXPECTED_RENAME=$(cd "$CHECK_DIR" && grep -rlE "NorthWest Patriots|NWP|nwp" --exclude-dir=.git --exclude-dir=deploy . | sed 's|^\./||' || true)

UNEXPECTED=""
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  f=$(sed -nE "s|^Files $CHECK_DIR/(.*) and .* differ$|\1|p" <<<"$line")
  if [[ -n "$f" ]] && grep -qxF "$f" <<<"$EXPECTED_RENAME"; then continue; fi
  UNEXPECTED+="$line"$'\n'
done <<<"$DIFFS"

if [[ -n "$UNEXPECTED" ]]; then
  echo
  echo "STOPPED - the live code has changes that aren't on GitHub:"
  echo "$UNEXPECTED"
  echo "Nothing was changed. Send this list to Claude."
  rm -rf "$CHECK_DIR"
  exit 1
fi
rm -rf "$CHECK_DIR"
echo "    Matches (only line endings / the rename differ)."

echo "==> Linking $APP_DIR to GitHub"
cd "$APP_DIR"
if [[ ! -d .git ]]; then
  git init -q
  git remote add origin "$REPO"
fi
git -c safe.directory="$APP_DIR" fetch -q origin main
# Mark the current (pre-rename) state as a known commit to roll back to.
git -c safe.directory="$APP_DIR" reset -q --mixed origin/main~1 2>/dev/null || \
  git -c safe.directory="$APP_DIR" reset -q --mixed origin/main

echo "==> Installing deploy script and timer"
curl -fsSL "$RAW/deploy-sylp.sh" -o /usr/local/bin/deploy-sylp
chmod 755 /usr/local/bin/deploy-sylp
curl -fsSL "$RAW/sylp-deploy.service" -o /etc/systemd/system/sylp-deploy.service
curl -fsSL "$RAW/sylp-deploy.timer" -o /etc/systemd/system/sylp-deploy.timer
sed -i 's/^Description=.*/Description=NorthWest Patriots storefront (Next.js)/' /etc/systemd/system/sylp.service
systemctl daemon-reload

echo "==> Running the first deploy (takes a few minutes)"
/usr/local/bin/deploy-sylp --force

systemctl enable --now sylp-deploy.timer
echo
echo "DONE. The shop now updates itself from GitHub every 2 minutes."
echo "Deploy log: journalctl -u sylp-deploy -n 50"
