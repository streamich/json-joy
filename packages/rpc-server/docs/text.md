## Reactive RPC server

An HTTP/1.1 and WebSocket server for [Reactive JSON-RPC](/specs/json-rx), built
on Node's `http`/`https` modules with a built-in WebSocket implementation (no
external WS dependency).


## Installation

```
npm install @jsonjoy.com/rpc-server
```


## Usage

```ts
import {RpcServer} from '@jsonjoy.com/rpc-server/lib/http1/RpcServer';

const server = await RpcServer.startWithDefaults({
  caller: myCallee,
  port: 8080,
});
```


## Features

- Path-based routing via [jit-router](https://github.com/streamich/json-joy/tree/master/packages/jit-router).
- WebSocket upgrade with a built-in frame codec; TLS with secure-context refresh.
- Multiple RPC codecs (Compact, Binary, JSON-RPC 2.0) and value encodings (JSON, CBOR, MessagePack).
- Content-type codec negotiation, auth token extraction (header/query/cookie), and CORS.
