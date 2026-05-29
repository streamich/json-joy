## RpcCodec

`RpcCodec<Message>` bundles three components:

| Field | Type | Role |
|---|---|---|
| `msg` | `MessageCodec<Message>` | Envelope codec (Compact / Binary / JSON-RPC 2.0) |
| `req` | `JsonValueCodec` | Value codec for *incoming* payloads |
| `res` | `JsonValueCodec` | Value codec for *outgoing* payloads |

When the request and response codecs differ, the wire specifier reflects it:
`rpc.rx.compact.cbor-json` means CBOR in, JSON out.


## API

```ts
class RpcCodec<Message> {
  constructor(msg, req, res);

  specifier(): RpcSpecifier;

  encode(messages: Message[], valueCodec?: JsonValueCodec): Uint8Array;
  decode(data: Uint8Array, valueCodec?: JsonValueCodec): Message[];
}
```

- `specifier()` returns the canonical `rpc.<...>` string for this codec
  combination.
- `encode(...)` defaults to the *response* codec (server side: encoding a
  response). Override `valueCodec` to use the request codec.
- `decode(...)` defaults to the *request* codec (server side: decoding an
  incoming request). Override for the response.


## Construction

```ts
import {RpcCodec, RpcMessageCodecs} from '@jsonjoy.com/rpc-codec';
import {Codecs} from '@jsonjoy.com/json-pack/lib/codecs/Codecs';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';

const msg = new RpcMessageCodecs();
const val = new Codecs(new Writer());

const compactJson = new RpcCodec(msg.compact, val.json, val.json);
const binaryCbor  = new RpcCodec(msg.binary, val.cbor, val.cbor);
const json2Json   = new RpcCodec(msg.jsonRpc2, val.json, val.json);
```


## Encoding a batch

```ts
import {RequestCompleteMessage} from '@jsonjoy.com/rpc-messages';
import {unknown} from '@jsonjoy.com/json-type';

const messages = [
  new RequestCompleteMessage(1, 'util.ping', undefined),
  new RequestCompleteMessage(2, 'util.echo', unknown({hello: 'world'})),
];

const bytes = compactJson.encode(messages);
// bytes is now the UTF-8 bytes of: [[1,1,"util.ping"],[1,2,"util.echo",{"hello":"world"}]]
```


## When to construct it manually

Most consumers use [`RpcCodecs`](/libs/rpc-codec/rpccodecs) (the registry)
to resolve a codec by specifier from a `Content-Type` header. Build
`RpcCodec` directly when:

- You're hard-coding a transport (e.g. a fixed-format client connecting to
  a known server).
- You're building a `RpcCodec` for a server endpoint that always uses one
  format.
- You're writing tests and want a fast, deterministic codec.
