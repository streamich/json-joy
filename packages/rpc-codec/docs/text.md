## RPC codec

`@jsonjoy.com/rpc-codec` aggregates every Reactive JSON-RPC message codec
into one entry point and provides a registry that resolves them from a
`Content-Type`-style specifier.

It plugs together:

- Three message-envelope formats: Compact (tuple), Binary (custom framing),
  and JSON-RPC 2.0.
- Three value codecs (from `@jsonjoy.com/json-pack`): JSON, CBOR, MessagePack.

The combination of one envelope + one value codec is an `RpcCodec`. The
combination of all envelopes + all value codecs is an `RpcCodecs`
registry, which resolves a specific `RpcCodec` from a string like
`rpc.rx.compact.cbor`.


## Installation

```
npm install @jsonjoy.com/rpc-codec
```


## Surface

| Area | Surface |
|---|---|
| [RpcCodec](/libs/rpc-codec/rpccodec) | One concrete codec: encode/decode batches |
| [RpcCodecs registry](/libs/rpc-codec/rpccodecs) | Resolve codecs by `Content-Type` specifier |
| [Batch codecs](/libs/rpc-codec/compact-batch) | Standalone `BatchCodec` implementations |


## Quick start

```ts
import {RpcCodec, RpcMessageCodecs} from '@jsonjoy.com/rpc-codec';
import {Codecs} from '@jsonjoy.com/json-pack/lib/codecs/Codecs';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';

const codecs = new RpcMessageCodecs();
const values = new Codecs(new Writer());

// Compact messages + JSON values
const codec = new RpcCodec(codecs.compact, values.json, values.json);

const bytes = codec.encode([msg1, msg2]);
const back = codec.decode(bytes);
```

Or build one set and look codecs up by specifier:

```ts
import {createCodecs} from '@jsonjoy.com/rpc-codec/lib/build';

const codecs = createCodecs();
const codec = codecs.get('rpc.rx.compact.cbor');
```


## Specifier grammar

```
rpc.<protocol>.<envelope>.<value-codec>[-<response-codec>]
```

| Slot | Values |
|---|---|
| `protocol` | `rx`, `json2` |
| `envelope` | `compact`, `binary` (for `rx`); `verbose` (for `json2`) |
| `value-codec` | `json`, `cbor`, `msgpack` |
| `response-codec` | (optional) override for the response only |

Examples: `rpc.rx.compact.json`, `rpc.rx.binary.cbor`,
`rpc.json2.verbose.json`, `rpc.rx.compact.cbor-json`.

The same grammar is used by [`rpc-server`](/libs/rpc-server) for
content-type negotiation.
