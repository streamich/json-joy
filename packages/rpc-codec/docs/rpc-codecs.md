## RpcCodecs registry

`RpcCodecs` owns one set of message-envelope codecs and one set of value
codecs, and resolves a concrete `RpcCodec` from a specifier string.

```ts
class RpcCodecs {
  constructor(val: Codecs, msg: RpcMessageCodecs);
  get(specifier: RpcSpecifier): RpcCodec<RxMessage>;
}
```

`RpcMessageCodecs` is the bundle of all three envelope codecs:

```ts
class RpcMessageCodecs {
  binary:   MessageCodec<RxMessage>;  // @jsonjoy.com/rpc-codec-binary
  compact:  MessageCodec<RxMessage>;  // @jsonjoy.com/rpc-codec-compact
  jsonRpc2: MessageCodec<RxMessage>;  // @jsonjoy.com/rpc-codec-json-rpc-2
}
```


## Construction

```ts
import {RpcCodecs, RpcMessageCodecs} from '@jsonjoy.com/rpc-codec';
import {Codecs} from '@jsonjoy.com/json-pack/lib/codecs/Codecs';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';

const writer = new Writer();
const codecs = new RpcCodecs(new Codecs(writer), new RpcMessageCodecs());
```

Or use the convenience helper:

```ts
import {createCodecs} from '@jsonjoy.com/rpc-codec/lib/build';

const codecs = createCodecs();
```


## Resolving a specifier

`get(specifier)` parses the string and returns the matching `RpcCodec`.
Throws `RpcError.codec()` (errno 415) if the specifier doesn't resolve.

```ts
codecs.get('rpc.rx.compact.json');         // Compact envelope, JSON values
codecs.get('rpc.rx.binary.cbor');          // Binary envelope, CBOR values
codecs.get('rpc.json2.verbose.json');      // JSON-RPC 2.0
codecs.get('rpc.rx.compact.cbor-json');    // CBOR in, JSON out
```

Specifier slots:

| Slot | Allowed |
|---|---|
| protocol | `rx`, `json2` |
| envelope | `compact`, `binary` (for `rx`); `verbose` (for `json2`) |
| request value codec | `json`, `cbor`, `msgpack` |
| response codec (optional) | same as above; only present when different from the request |


## How `rpc-server` uses it

`Http1Server` constructs an `RpcCodecs` and a default `RpcCodec` per route.
On each incoming request it reads the `Content-Type` header, calls
`codecs.get(...)`, and replaces the connection context's `reqCodec`,
`resCodec`, and `msgCodec` with the resolved set --- see
[Connection context](/libs/rpc-server/connection-context).


## How `rpc-client` uses it

The client picks the codec at construction time. `createBinaryClient(url)`
uses Binary + CBOR; `createJsonClient(url)` uses Compact + JSON. The chosen
codec's `specifier()` is sent as a WebSocket subprotocol so the server
selects the matching format on its end.
