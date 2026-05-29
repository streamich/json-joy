## Reactive RPC server

`@jsonjoy.com/rpc-server` is an HTTP/1.1 and WebSocket server that exposes a
[Reactive JSON-RPC](/specs/json-rx) callee --- a set of typed RPC methods built
with `@jsonjoy.com/rpc-calls` --- over the network. It speaks three RPC
protocols (Compact, Binary, JSON-RPC 2.0) and three value codecs (JSON, CBOR,
MessagePack), with content-type negotiation per request.

Two backends are supplied:

- A pure Node.js backend on top of `http`/`https` with a built-in WebSocket
  implementation (no `ws` dependency).
- A uWebSockets.js backend as an alternative and for testing.


## Installation

```
npm install @jsonjoy.com/rpc-server @jsonjoy.com/rpc-calls
```


## Quick start

```ts
import {RpcServer} from '@jsonjoy.com/rpc-server/lib/http1/RpcServer';
import {createRpcCallee} from '@jsonjoy.com/rpc-calls/lib/testing/Callee.fixtures';

const server = await RpcServer.startWithDefaults({
  port: 9999,
  callee: createRpcCallee(),
});

console.log(server + '');
```

`startWithDefaults` wires up CORS, ping endpoints, HTTP RPC, JSON-RPC 2.0,
WebSocket RPC, and a `/schema` endpoint. Hit it with:

```
curl localhost:9999/rpc -H 'Content-Type: rpc.rx.compact.json' -d '[1,1,"ping"]'
websocat ws://localhost:9999/rx
```


## Surface

| Area | Surface |
|---|---|
| Node http backend | [`RpcServer`, `Http1Server`](/libs/rpc-server/http1-server) |
| uWebSockets backend | [`RpcApp`](/libs/rpc-server/uws-backend) |
| Per-request data | [`ConnectionContext`](/libs/rpc-server/connection-context), token extraction, codec negotiation |


## How this fits with the rest of json-joy

The server hosts a "callee" built with [`@jsonjoy.com/rpc-calls`](/libs/rpc-calls).
On the wire it speaks the [Reactive JSON-RPC](/specs/json-rx) message set
defined in [`@jsonjoy.com/rpc-messages`](/libs/rpc-messages) and encoded by
[`@jsonjoy.com/rpc-codec`](/libs/rpc-codec). The matching browser client is
[`@jsonjoy.com/rpc-client`](/libs/rpc-client). For a complete example of a
callee implementation that ships with this stack, see
[`@jsonjoy.com/json-crdt-server`](/libs/json-crdt-server).
