## Compact batch helpers

Two standalone codecs that implement the
[`BatchCodec` interface](/libs/rpc-codec-base) for the Compact envelope.
Unlike `MessageCodec`, they take a `Message[]` in and produce a single
chunk out --- no shared `Writer`, no streaming.

| Class | Chunk type | When to use |
|---|---|---|
| `CompactStrBatchCodec` | `string` | Text transports (e.g. WebSocket text frame) |
| `CompactBinBatchCodec` | `Uint8Array` | Binary transports; encodes the string codec's output to UTF-8 |


## `CompactStrBatchCodec`

```ts
import {CompactStrBatchCodec} from '@jsonjoy.com/rpc-codec';
import {RequestCompleteMessage} from '@jsonjoy.com/rpc-messages';

const codec = new CompactStrBatchCodec();
const chunk = codec.toChunk([new RequestCompleteMessage(1, 'util.ping')]);
// '[[1,1,"util.ping"]]'

const messages = codec.fromChunk(chunk);
// [RequestCompleteMessage { id: 1, method: 'util.ping' }]
```

Uses `@jsonjoy.com/json-pack/json-binary` for `stringify` / `parse`, so
binary payloads survive the round trip.

`id`: `'str-rx-compact-lite'`. `format`: `RpcMessageFormat.Compact`.


## `CompactBinBatchCodec`

A thin wrapper that delegates to `CompactStrBatchCodec` and converts the
resulting string to/from UTF-8:

```ts
import {CompactBinBatchCodec} from '@jsonjoy.com/rpc-codec';

const codec = new CompactBinBatchCodec();
const bytes = codec.toChunk([new RequestCompleteMessage(1, 'util.ping')]);
// Uint8Array of '[[1,1,"util.ping"]]'

const messages = codec.fromChunk(bytes);
```

`id`: `'bin-rx-compact-lite'`. `format`: `RpcMessageFormat.Compact`.


## When to use these vs. `RpcCodec`

| Need | Use |
|---|---|
| Encode an entire batch, ship it, throw it away | `Compact*BatchCodec` |
| Write into a long-lived `Writer` reused across requests | `RpcCodec` with a `MessageCodec` |
| Negotiate format via `Content-Type` | [`RpcCodecs` registry](/libs/rpc-codec/rpc-codecs) |

The batch codecs are used by `UnaryCaller` in
[`rpc-calls`](/libs/rpc-calls) for HTTP-style RPC, where each `fetch()`
sends a fresh chunk.
