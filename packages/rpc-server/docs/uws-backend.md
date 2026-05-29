## uWebSockets.js backend

`RpcApp` is an alternative server built on
[`uWebSockets.js`](https://github.com/uNetworking/uWebSockets.js). It exposes
the same RPC endpoints as `RpcServer` but uses uWS for HTTP and WebSockets.

`uWebSockets.js` is a peer dependency you install separately:

```
npm install uWebSockets.js@uNetworking/uWebSockets.js#v20.61.0
```


## Quick start

```ts
import {App} from 'uWebSockets.js';
import {RpcApp} from '@jsonjoy.com/rpc-server/lib/uws/RpcApp';

const app = new RpcApp({
  uws: App({}),
  callee: myCallee,
  port: 9999,
});

app.startWithDefaults();
```

`startWithDefaults()` mirrors the HTTP/1.1 defaults: CORS, `/ping`, `/rx`
(Reactive RPC), `/rpc` (JSON-RPC 2.0), `/rx` WebSocket, and routes via the
internal `jit-router`.


## Options

| Option | Required | Description |
|---|---|---|
| `uws` | yes | uWS `App` or `SSLApp` instance |
| `callee` | yes | The RPC callee to dispatch incoming messages to |
| `port` | no | Defaults to `process.env.PORT` or `9999` |
| `host` | no | Defaults to `process.env.HOST` or `'0.0.0.0'` |
| `maxRequestBodySize` | no | HTTP body cap in bytes; defaults to `1 MiB` |
| `codecs` | no | Override the `Codecs` set used for value encoding |
| `augmentContext` | no | Hook to attach data to every connection's `ctx.meta` |
| `logger` | no | Defaults to `console` |


## Custom routes

`RpcApp.route(method, path, handler)` registers a JSON-returning handler. The
return value is encoded with the response codec and written to the socket:

```ts
app.route('GET', '/users/:id', async (ctx) => {
  return {id: ctx.params?.[0], name: 'Alice'};
});
```

Use `routeRaw(...)` if you need full control over the response, including
non-JSON bodies.


## Picking a backend

| If you want... | Use |
|---|---|
| Pure Node, no native deps | [`RpcServer`](/libs/rpc-server/http1-server) |
| Highest throughput | `RpcApp` (this page) |
| TLS with hot certificate rotation | [`RpcServer`](/libs/rpc-server/http1-server) |
| Compatibility with platforms that ban native modules | [`RpcServer`](/libs/rpc-server/http1-server) |

Both backends share the same [`ConnectionContext`](/libs/rpc-server/connection-context)
shape, so your callee code is portable between them.
