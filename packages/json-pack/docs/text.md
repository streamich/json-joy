`json-pack` is a collection of high-performance serialization codecs ---
the fastest in the JavaScript ecosystem for both encoding and decoding. It has
no runtime dependencies on external codec libraries and runs in Node.js, Deno,
Bun, and browsers.

```ts
import {MessagePackEncoder, MessagePackDecoder} from '@jsonjoy.com/json-pack/lib/msgpack';

const encoder = new MessagePackEncoder();
const decoder = new MessagePackDecoder();

const data = {hello: 'world', numbers: [1, 2, 3]};
const blob = encoder.encode(data);   // Uint8Array
decoder.decode(blob);                // {hello: 'world', numbers: [1, 2, 3]}
```

## Install

```
npm install @jsonjoy.com/json-pack
```

Each codec lives under its own subpath, so you only pull in the format you use:
`@jsonjoy.com/json-pack/lib/cbor`, `.../lib/msgpack`, `.../lib/json`, and so on.

## The encoder / decoder model

Every format follows the same shape: an **encoder** turns a JavaScript value
into a `Uint8Array`, and a **decoder** turns a `Uint8Array` back into a value.

```ts
const buf = encoder.encode(value); // value -> Uint8Array
const value = decoder.decode(buf); // Uint8Array -> value
```

Encoders and decoders are **stateful, reusable objects** --- construct one and
call it many times. An encoder writes into an internal growable buffer (a
`Writer` from [`@jsonjoy.com/buffers`](https://github.com/streamich/json-joy)),
which it reuses across calls, so a long-lived encoder avoids per-call
allocations. You can pass your own `Writer` to the constructor to share one
buffer across several encoders:

```ts
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor';

const writer = new Writer();
const encoder = new CborEncoder(writer);
```

~~~jj.note
Because the encoder reuses its buffer, the `Uint8Array` returned by `encode()`
is only valid until the next `encode()` call on that encoder. Copy it if you
need to keep it around.
~~~

## Choosing a format

| Page | Format | Reach for it when |
|------|--------|-------------------|
| [CBOR](/libs/json-pack/cbor) | RFC 8949 | A standardized, self-describing binary format; the fastest codec here |
| [MessagePack](/libs/json-pack/messagepack) | msgpack | Interop with the MessagePack ecosystem; compact binary |
| [JSON](/libs/json-pack/json) | JSON + binary | Drop-in for `JSON.stringify`/`parse` on the hot path, or JSON that must carry `Uint8Array` |
| [More formats](/libs/json-pack/more-formats) | UBJSON, BSON, RESP, Bencode, Ion | Talking to a system that speaks one of these protocols |

## Fast vs. full encoders

Several formats ship a `*Fast` encoder alongside the full one. The fast variant
handles only plain JSON values (`null`, booleans, numbers, strings, arrays,
objects) and is the quickest path when that is all you have. The full encoder
adds binary data, extensions/tags, and other format-specific types. See each
codec's page for the exact set of classes.

This package is part of [json-joy](/libs/json-joy-js); the serialization
formats are also described in the [specs section](/specs).
