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


## CORS

`enableCors()` does two things: it answers the `OPTIONS` preflight on every
path, and it attaches the cross-origin headers to *every* response the server
sends --- including 404s and internal errors. Browsers refuse to hand a
response body to the page unless `Access-Control-Allow-Origin` is on the real
response, not just on the preflight.

The defaults allow any origin and no credentials:

| Header | Default |
|---|---|
| `Access-Control-Allow-Origin` | `*` |
| `Access-Control-Allow-Methods` | `GET, POST, PUT, DELETE, PATCH, OPTIONS` |
| `Access-Control-Allow-Headers` | `Content-Type, Authorization` |
| `Access-Control-Max-Age` | `86400` |

`Content-Type` has to be in `Allow-Headers`: the `application/x.rpc.*` media
types this server negotiates are not CORS-safelisted, so an RPC `POST` always
triggers a preflight and fails without it.

Pass options to change any of it:

```ts
rpc.enableCors({
  origin: 'https://app.example.com',
  methods: 'POST, OPTIONS',
  headers: 'Content-Type, Authorization, X-Trace',
  expose: 'X-Trace',
  maxAge: 600,
});
```

`origin: true` echoes the request `Origin` header back and adds `Vary: Origin`.
Set `credentials: true` to send `Access-Control-Allow-Credentials`, which
switches the origin to echo mode automatically --- browsers reject a credentialed
response whose origin is `*`.

`startWithDefaults` takes the same options under a `cors` key:

```ts
await RpcServer.startWithDefaults({
  port: 9999,
  callee: myCallee,
  cors: {origin: 'https://app.example.com', credentials: true},
});
```


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
| `enableCors(opts?)` | `OPTIONS *` | Preflight + CORS headers on every response |
| `enableHttpPing()` | `/ping`, `/up` | Liveness + Kamal probes |
| `enableHttpRpc(path?)` | `/rx` | Reactive RPC over HTTP (Compact by default) |
| `enableJsonRcp2HttpRpc(path?)` | `/rpc` | JSON-RPC 2.0 over HTTP |
| `enableWsRpc(path?)` | `/rx` | WebSocket upgrade with Reactive RPC |
| `enableSchema(path?, method?)` | `GET /schema` | Gzipped JSON Type schema |
| `enableDefaults()` | --- | All of the above |
