[CBOR](https://cbor.io/) (RFC 8949) is a standardized, self-describing binary
format. `json-pack`'s CBOR codec is the fastest in this package and a good
default when you control both ends of the wire.

```ts
import {CborEncoder, CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor';

const encoder = new CborEncoder();
const decoder = new CborDecoder();

const buf = encoder.encode({id: 123, tags: ['a', 'b']});
decoder.decode(buf); // {id: 123, tags: ['a', 'b']}
```

## Encoders

| Class | Use |
|-------|-----|
| `CborEncoderFast` | Plain JSON values only --- the fastest path |
| `CborEncoder` | Full CBOR: adds binary (`Uint8Array`), tags, `undefined`, and `bigint` |
| `CborEncoderStable` | Deterministic output: object keys sorted, shortest-form integers |
| `CborEncoderDag` | [DAG-CBOR](https://ipld.io/specs/codecs/dag-cbor/spec/) for IPLD/content addressing |

Pick `CborEncoderFast` when you only ever encode JSON-compatible data; reach for
`CborEncoder` the moment you need `Uint8Array` values or tags. Use the `Stable`
variant when bytes must be reproducible (hashing, signatures), and `Dag` for
IPLD.

## Decoders

| Class | Use |
|-------|-----|
| `CborDecoderBase` | All standard decoding; smallest footprint |
| `CborDecoder` | Adds shallow / one-level-at-a-time decoding and value skipping |
| `CborDecoderDag` | DAG-CBOR decoding |

If you do not need the shallow-reading helpers, importing `CborDecoderBase`
keeps the bundle smaller.

## Tags

CBOR tags (and MessagePack extensions) are represented by `JsonPackExtension`.
Wrap a value to have it encoded with a tag; the decoder hands you back a
`JsonPackExtension` for tagged values.

```ts
import {CborEncoder, JsonPackExtension} from '@jsonjoy.com/json-pack/lib/cbor';

const encoder = new CborEncoder();
// Tag 0 (date/time string):
const buf = encoder.encode(new JsonPackExtension(0, '2024-01-01T00:00:00Z'));
```

To splice in already-encoded CBOR bytes verbatim, wrap them in a
`JsonPackValue`; the encoder writes the buffer as-is.

## Shallow decoding

`CborDecoder` can read a single value deep inside a document without
materializing the whole thing --- useful for plucking one field out of a large
blob. Reset the reader onto your buffer, then read level by level.

```ts
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor';

const decoder = new CborDecoder();
decoder.reader.reset(buf);
// ...navigate with the reader / map helpers and read just what you need.
```

For an ergonomic key/index navigation API of the same kind, see the
`findKey`/`findIndex`/`find` helpers on
[MessagePack's decoder](/libs/json-pack/messagepack).
