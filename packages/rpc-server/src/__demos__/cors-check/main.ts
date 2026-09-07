// Verifies CORS the way curl cannot: a real browser fetch from a different origin.
// Run: npx ts-node packages/rpc-server/src/__demos__/cors-check/main.ts
// Then open http://127.0.0.1:9998 --- the page is served from :9998 and calls :9999.
// Point it at a deployed instance with ?target=https://pub-1-api.jsonjoy.org

import {createRpcCallee} from '@jsonjoy.com/rpc-calls/lib/testing/Callee.fixtures';
import * as http from 'http';
import {Http1Server} from '../../http1/Http1Server';
import {RpcServer} from '../../http1/RpcServer';

const PAGE_PORT = +(process.env.PAGE_PORT || 9998);
const RPC_PORT = +(process.env.PORT || 9999);

const page = `<!doctype html>
<meta charset="utf-8">
<title>CORS check</title>
<body style="font:14px system-ui;padding:2rem">
<h1>CORS check</h1>
<p>Page origin: <code id="origin"></code></p>
<p>Target: <code id="target"></code></p>
<pre id="out"></pre>
<script>
const target = new URLSearchParams(location.search).get('target') || 'http://127.0.0.1:${RPC_PORT}';
document.getElementById('origin').textContent = location.origin;
document.getElementById('target').textContent = target;
const out = document.getElementById('out');
const log = (ok, name, detail) => {
  out.textContent += (ok ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  ' + detail : '') + '\\n';
};
const run = async () => {
  try {
    const res = await fetch(target + '/ping');
    log(res.ok, 'GET /ping', 'status ' + res.status);
  } catch (err) { log(false, 'GET /ping', String(err)); }
  try {
    // A non-safelisted Content-Type: this is the request that forces a preflight.
    const res = await fetch(target + '/rx', {
      method: 'POST',
      headers: {'Content-Type': 'application/x.rpc.rx.compact.json'},
      body: JSON.stringify([[1, 1, 'ping']]),
    });
    log(res.ok, 'POST /rx (preflighted)', 'status ' + res.status + ' body ' + (await res.text()).slice(0, 80));
  } catch (err) { log(false, 'POST /rx (preflighted)', String(err)); }
  try {
    const res = await fetch(target + '/nothing-here');
    log(res.status === 404, 'GET 404 path readable', 'status ' + res.status);
  } catch (err) { log(false, 'GET 404 path readable', String(err)); }
};
run();
</script>
`;

const main = async () => {
  const server = (await Http1Server.create()) as http.Server;
  const http1 = new Http1Server({server});
  const rpc = new RpcServer({http1, callee: createRpcCallee(), logger: console});
  rpc.enableDefaults();
  await http1.start();
  server.listen(RPC_PORT, '127.0.0.1');
  http
    .createServer((_req, res) => {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(page);
    })
    .listen(PAGE_PORT, '127.0.0.1', () => {
      console.log('Open http://127.0.0.1:' + PAGE_PORT + ' --- RPC server on :' + RPC_PORT);
    });
};

main().catch(console.error);
