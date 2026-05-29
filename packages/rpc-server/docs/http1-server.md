## HTTP/1.1 backend

The Node.js backend is built around two classes:

- `Http1Server` --- low-level HTTP/1.1 + WebSocket server with `jit-router`
  path routing.
- `RpcServer` --- wraps an `Http1Server` and registers the standard RPC
  endpoints on top of it.

For most use cases, call `RpcServer.startWithDefaults(...)` and forget about
the layering.


## Starting with defaults

```ts
import {RpcServer} from '@jsonjoy.com/rpc-server/lib/http1/RpcServer';

const server = await RpcServer.startWithDefaults({
  port: 9999,         // defaults to 8080
  host: '127.0.0.1',  // optional
  callee: myCallee,
  logger: console,    // optional, defaults to console
});
```

`enableDefaults()` is called for you, which registers:

| Endpoint | Method | Purpose |
|---|---|---|
| `/ping` | GET | Liveness probe (returns `"pong"`) |
| `/up` | GET | Kamal-compatible health probe |
| `/rx` | POST | Reactive RPC over HTTP using Compact messages |
| `/rpc` | POST | JSON-RPC 2.0 over HTTP |
| `/rx` | WS upgrade | Bidirectional Reactive RPC |
| `/schema` | GET | gzipped JSON Type schema dump |
| `/{::\n}` | OPTIONS | CORS preflight (allow all origins) |


## Custom routing

Skip `startWithDefaults` if you want to opt-in to individual features or add
your own routes:

```ts
import {Http1Server} from '@jsonjoy.com/rpc-server/lib/http1/Http1Server';
import {RpcServer} from '@jsonjoy.com/rpc-server/lib/http1/RpcServer';

const httpServer = await Http1Server.create();
const http1 = new Http1Server({server: httpServer});
const rpc = new RpcServer({http1, callee: myCallee});

rpc.enableCors();
rpc.enableHttpRpc('/rx');
rpc.enableWsRpc('/rx');

http1.route({
  method: 'GET',
  path: '/health',
  handler: (ctx) => {
    ctx.res.writeHead(200, {'Content-Type': 'application/json'});
    ctx.res.end('{"ok":true}');
  },
});

await http1.start();
httpServer.listen(9999);
```

Paths are compiled by `@jsonjoy.com/jit-router` --- they support typed
parameters, e.g. `/users/{id}`.


## TLS

Pass `create.tls = true` and a `secureContext` provider. The provider is
re-invoked on `secureContextRefreshInterval` so you can rotate certificates
without restarting:

```ts
await RpcServer.startWithDefaults({
  port: 443,
  callee: myCallee,
  create: {
    tls: true,
    secureContext: async () => ({
      key: await fs.promises.readFile('server.key'),
      cert: await fs.promises.readFile('server.crt'),
    }),
    secureContextRefreshInterval: 24 * 60 * 60 * 1000,
  },
});
```


## Available enables

| Method | Default path | Description |
|---|---|---|
| `enableCors()` | `OPTIONS *` | Allow any origin, any method |
| `enableHttpPing()` | `/ping`, `/up` | Liveness + Kamal probes |
| `enableHttpRpc(path?)` | `/rx` | Reactive RPC over HTTP (Compact by default) |
| `enableJsonRcp2HttpRpc(path?)` | `/rpc` | JSON-RPC 2.0 over HTTP |
| `enableWsRpc(path?)` | `/rx` | WebSocket upgrade with Reactive RPC |
| `enableSchema(path?, method?)` | `GET /schema` | Gzipped JSON Type schema |
| `enableDefaults()` | --- | All of the above |
