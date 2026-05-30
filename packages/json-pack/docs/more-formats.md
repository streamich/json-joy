Beyond CBOR, MessagePack, and JSON, `json-pack` ships codecs for several other
binary and wire formats. They follow the same `encode` / `decode` shape; reach
for one when you need to talk to a system that speaks that protocol. Some
encoders require a `Writer` instance (from `@jsonjoy.com/buffers`) in their
constructor --- the examples below show which.

## UBJSON

[Universal Binary JSON](https://ubjson.org/). Encoder needs a `Writer`.

```ts
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {UbjsonEncoder, UbjsonDecoder} from '@jsonjoy.com/json-pack/lib/ubjson';

const encoder = new UbjsonEncoder(new Writer());
const decoder = new UbjsonDecoder();
decoder.decode(encoder.encode({id: 123}));
```

## BSON

[BSON](https://bsonspec.org/), the binary format used by MongoDB. Encode a
document with `BsonEncoder` (needs a `Writer`), decode with `BsonDecoder`. The
`bson` module also exports value wrappers for BSON-specific types.

```ts
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {BsonEncoder, BsonDecoder} from '@jsonjoy.com/json-pack/lib/bson';

const encoder = new BsonEncoder(new Writer());
const decoder = new BsonDecoder();
```

## RESP

[Redis Serialization Protocol](https://redis.io/docs/latest/develop/reference/protocol-spec/),
versions 2 and 3 --- handy for building Redis clients/servers.

| Class | Use |
|-------|-----|
| `RespEncoder` | Encode values to RESP (RESP3) |
| `RespEncoderLegacy` | RESP2 encoder |
| `RespDecoder` | Decode a complete RESP message |
| `RespStreamingDecoder` | Incremental decoder for streamed data --- feed bytes, pull values as they complete |

`RespEncoder` defaults its `Writer`, so it constructs with no arguments.

```ts
import {RespEncoder, RespDecoder} from '@jsonjoy.com/json-pack/lib/resp';

const encoder = new RespEncoder();
const decoder = new RespDecoder();
decoder.decode(encoder.encode(['PING']));
```

## Bencode

[Bencode](https://en.wikipedia.org/wiki/Bencode), BitTorrent's encoding. Encoder
needs a `Writer`.

```ts
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {BencodeEncoder, BencodeDecoder} from '@jsonjoy.com/json-pack/lib/bencode';

const encoder = new BencodeEncoder(new Writer());
const decoder = new BencodeDecoder();
```

## Amazon Ion

[Amazon Ion](https://amazon-ion.github.io/ion-docs/). `IonEncoderFast` defaults
its `Writer`; decode with `IonDecoder`.

```ts
import {IonEncoderFast, IonDecoder} from '@jsonjoy.com/json-pack/lib/ion';

const encoder = new IonEncoderFast();
const decoder = new IonDecoder();
decoder.decode(encoder.encode({id: 123}));
```
