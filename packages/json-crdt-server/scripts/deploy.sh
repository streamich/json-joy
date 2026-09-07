#!/usr/bin/env bash
#
# Usage:
#   bash packages/json-crdt-server/scripts/deploy.sh
#
# Optional — wipe the database on this deploy:
#   WIPE_DB=1 bash packages/json-crdt-server/scripts/deploy.sh

set -euo pipefail

# Ensure local node_modules/.bin (tsc, etc.) are on PATH
export PATH="$PWD/node_modules/.bin:$PATH"

DOMAIN="pub-1-api.jsonjoy.org"
HOST="78.47.129.147"
SSH_KEY="$HOME/.ssh/jsonjoy_org_deploy"
SSH="ssh -i $SSH_KEY"
SCP="scp -i $SSH_KEY"
DEPLOY_USER="deploy"
APP_DIR="/srv/json-crdt-server"
WIPE_DB="${WIPE_DB:-0}"

# 1. build + pack
echo "==> Building"
yarn workspace @jsonjoy.com/json-crdt-server build

echo "==> Packing"
(cd packages/json-crdt-server && yarn pack -o /tmp/json-crdt-server.tgz)

# 2. push artifacts
echo "==> Uploading to ${HOST}"
scp -i "$SSH_KEY" \
  /tmp/json-crdt-server.tgz \
  packages/json-crdt-server/ecosystem.config.js \
  "${DEPLOY_USER}@${HOST}:~/"

# 3. install + restart
echo "==> Restarting server"
$SSH "${DEPLOY_USER}@${HOST}" "
  set -e
  export NVM_DIR=\"\$HOME/.nvm\"
  . \"\$NVM_DIR/nvm.sh\"

  if [[ '${WIPE_DB}' == '1' ]]; then
    echo '--- wiping database'
    pm2 stop json-crdt-server || true
    rm -rf /var/lib/json-crdt-server/db
  fi

  mkdir -p ${APP_DIR}
  tar -xzf ~/json-crdt-server.tgz -C ${APP_DIR} --strip-components=1
  cp ~/ecosystem.config.js ${APP_DIR}/ecosystem.config.js
  cd ${APP_DIR}
  npm install --omit=dev
  pm2 restart json-crdt-server 2>/dev/null || pm2 start ecosystem.config.js
  pm2 save
"

# 4. smoke test
sleep 2

echo "==> Ping"
curl -sf "https://${DOMAIN}/rpc" \
  -H 'Content-Type: rpc.rx.compact.json' \
  -d '[1,1,"util.ping"]' && echo "OK"

echo "==> CORS"
ORIGIN='https://jsonjoy.com'
preflight=$(curl -sf -o /dev/null -D- -X OPTIONS "https://${DOMAIN}/rx" \
  -H "Origin: ${ORIGIN}" \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type')
actual=$(curl -sf -o /dev/null -D- -X POST "https://${DOMAIN}/rx" \
  -H "Origin: ${ORIGIN}" \
  -H 'Content-Type: application/x.rpc.rx.compact.json' \
  -d '[[1,1,"util.ping"]]')

cors_ok=1
grep -qi '^access-control-allow-headers:.*content-type' <<<"$preflight" || {
  echo "FAIL: preflight does not allow the Content-Type header"
  cors_ok=0
}
grep -qi '^access-control-allow-origin:' <<<"$actual" || {
  echo "FAIL: the POST response carries no Access-Control-Allow-Origin"
  cors_ok=0
}
if [[ "$cors_ok" == 1 ]]; then
  echo "OK"
else
  echo "The browser client cannot use this server. Publish @jsonjoy.com/rpc-server"
  echo "and @jsonjoy.com/rpc-codec at the version this tree pins, then deploy again."
  exit 1
fi
