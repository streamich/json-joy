## Quick clients

Three factories cover the common WebSocket configurations. They differ only
in which codecs they construct.

| Factory | Message format | Value codec | Specifier sent |
|---|---|---|---|
| `createBinaryClient` | Binary | CBOR | `rpc.rx.binary.cbor` |
| `createJsonClient` | Compact | JSON | `rpc.rx.compact.json` |
| `createClient(codec, ...)` | --- you bring the `RpcCodec` --- | per `codec.specifier()` |


## `createBinaryClient(url, token?)`

The default for binary servers. CBOR keeps payloads compact and survives
`Uint8Array` round-trips without base64.

```ts
import {createBinaryClient} from '@jsonjoy.com/rpc-client';

const client = createBinaryClient('wss://example.com/rx');

const {value} = await client.call('util.info', undefined);
```

This is what [`@jsonjoy.com/json-crdt-repo`](/libs/json-crdt-repo) uses
internally to talk to [`json-crdt-server`](/libs/json-crdt-server).


## `createJsonClient(url, token?)`

JSON envelope and payload. Larger on the wire but trivially inspectable in
DevTools.

```ts
import {createJsonClient} from '@jsonjoy.com/rpc-client';

const client = createJsonClient('wss://example.com/rx');
```


## `createClient(codec, url, token?)`

The general entry point. Bring your own `RpcCodec` (see
[`rpc-codec`](/libs/rpc-codec/rpc-codec)) and `createClient` wires up the
WebSocket transport, persistent reconnect, and keep-alive ping for you.

```ts
import {createClient} from '@jsonjoy.com/rpc-client';
import {RpcCodec} from '@jsonjoy.com/rpc-codec';
import {RxBinaryMessageCodec} from '@jsonjoy.com/rpc-codec-binary';
import {MsgPackJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/msgpack';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';

const writer = new Writer(1024 * 4);
const val = new MsgPackJsonValueCodec(writer);
const codec = new RpcCodec(new RxBinaryMessageCodec(), val, val);

const client = createClient(codec, 'wss://example.com/rx');
```


## What "auto-reconnect" means

The factories construct an
[`RxPersistentCaller`](/libs/rpc-calls/caller) on top of a
[`PersistentPhysicalChannel`](/libs/channel/persistent-channel). Defaults:

| Behavior | Default |
|---|---|
| Reconnect backoff | 1--2 s start, ×1.3 growth, 10 s cap |
| Connection considered stable after | 5 s open |
| Keep-alive notification | `.ping` every 15 s |

To tune, build the underlying `RxPersistentCaller` yourself --- see
[Custom client](/libs/rpc-client/custom-client).


## Picking which factory

| Need | Use |
|---|---|
| Smallest payloads, default | `createBinaryClient` |
| Debug-friendly, human-readable wire | `createJsonClient` |
| MessagePack, JSON-RPC 2.0, or custom split codecs | `createClient` |
| Fetch-style HTTP transport (no streaming) | [`FetchCaller`](/libs/rpc-calls/caller) from `rpc-calls` |
