[MessagePack](https://msgpack.org/) is a compact binary format with a wide
ecosystem. Use this codec when you need to interoperate with other MessagePack
implementations.

```ts
import {MessagePackEncoder, MessagePackDecoder} from '@jsonjoy.com/json-pack/lib/msgpack';

const encoder = new MessagePackEncoder();
const decoder = new MessagePackDecoder();

const buf = encoder.encode({id: 123, tags: ['a', 'b']});
decoder.decode(buf); // {id: 123, tags: ['a', 'b']}
```

`MessagePackEncoder` / `MessagePackDecoder` are aliases for `MsgPackEncoder` /
`MsgPackDecoder`.

## Encoders

| Class | Use |
|-------|-----|
| `MsgPackEncoderFast` | Plain JSON values only --- the fastest path |
| `MsgPackEncoder` | Full MessagePack: adds binary (`Uint8Array`) and extensions |
| `MsgPackEncoderStable` | Deterministic output with object keys sorted |

## Decoders

| Class | Use |
|-------|-----|
| `MsgPackDecoderFast` | Standard decoding |
| `MsgPackDecoder` | Adds shallow reading (`findKey`, `findIndex`, `find`) and value skipping |

## Extensions

MessagePack extensions are represented by `JsonPackExtension` (the same wrapper
CBOR uses for tags). The first argument is the extension type, the second the
payload.

```ts
import {MsgPackEncoder, JsonPackExtension} from '@jsonjoy.com/json-pack/lib/msgpack';

const encoder = new MsgPackEncoder();
const buf = encoder.encode(new JsonPackExtension(1, new Uint8Array([1, 2, 3])));
```

Use `JsonPackValue` to embed a pre-encoded MessagePack value verbatim.

## Shallow reading

`MsgPackDecoder` can extract a single value from deep inside a document without
decoding everything around it --- much faster than a full `decode` when you only
want one field. Reset the reader onto the buffer, navigate by key or index, then
read.

```ts
import {MsgPackDecoder} from '@jsonjoy.com/json-pack/lib/msgpack';

const decoder = new MsgPackDecoder();
decoder.reader.reset(buf);

decoder.findKey('foo').readAny();      // value at .foo
```

`findKey`, `findIndex`, and `find` return the decoder, so they chain. `find`
takes a path of mixed keys and indices:

```ts
decoder.reader.reset(buf);
decoder.find(['a', 'b', 1]).readAny(); // value at .a.b[1]
```

Reset the reader before each independent lookup.
