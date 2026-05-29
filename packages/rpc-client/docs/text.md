## RPC client

`@jsonjoy.com/rpc-client` is the browser-side counterpart of
[`@jsonjoy.com/rpc-server`](/libs/rpc-server). It is a thin glue layer over:

- [`channel`](/libs/channel) --- the persistent WebSocket transport.
- [`rpc-calls`](/libs/rpc-calls) --- the streaming caller (`RxPersistentCaller`).
- [`rpc-codec`](/libs/rpc-codec) --- the message + value codec pair.

Three exported factories build the most common combinations. For full
control (custom codec, custom transport, custom auth), construct
`RxPersistentCaller` directly --- see [Custom client](/libs/rpc-client/custom-client).


## Installation

```
npm install @jsonjoy.com/rpc-client
```


## Surface

| Area | Surface |
|---|---|
| [Quick clients](/libs/rpc-client/quick-clients) | `createBinaryClient`, `createJsonClient`, `createClient` |
| [Custom client](/libs/rpc-client/custom-client) | Build your own `RxPersistentCaller` |


## Quick start

The default: binary CBOR over WebSocket, auto-reconnecting, with a 15-second
keep-alive ping.

```ts
import {createBinaryClient} from '@jsonjoy.com/rpc-client';

const client = createBinaryClient('wss://example.com/rx');

const pong = await client.call('util.ping', undefined);
// 'pong'

client.call$('block.listen', {id: 'doc-42'})
  .subscribe(({event}) => console.log(event));

client.notify('telemetry.tick', {ts: Date.now()});

client.stop();
```


## What you get

The returned object satisfies the [`Caller` interface](/libs/rpc-calls/caller):

| Method | Use |
|---|---|
| `call(method, request)` | Unary request → single response promise |
| `call$(method, data)` | Streaming: pass a value or `Observable`, get back `Observable<Response>` |
| `notify(method, data)` | Fire-and-forget |
| `start()` / `stop()` | Lifecycle of the underlying persistent channel |


## Auth tokens

All three factories accept an optional `token` second argument. It is sent
as a WebSocket subprotocol alongside the codec specifier:

```ts
const client = createBinaryClient('wss://example.com/rx', 'tkn.abc123');
```

The server (using [`rpc-server`](/libs/rpc-server)) extracts it via
`ctx.token`. See [Connection context](/libs/rpc-server/connection-context)
for the full extraction rules.
