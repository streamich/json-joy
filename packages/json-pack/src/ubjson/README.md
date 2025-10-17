# UBJSON Codec

Universal Binary JSON (UBJSON) encoder and decoder with high-performance implementation.

## Features

- High-performance UBJSON encoding and decoding
- Support for all UBJSON data types
- About an order of magnitude faster than other implementations
- Efficient binary representation

## Usage

Note: UbjsonEncoder requires a Writer instance from the `@jsonjoy.com/util` package. Make sure to install it as a peer dependency:

```bash
npm install @jsonjoy.com/util
```

### Basic Usage

```ts
import {UbjsonEncoder, UbjsonDecoder} from '@jsonjoy.com/json-pack/lib/ubjson';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';

const writer = new Writer();
const encoder = new UbjsonEncoder(writer);
const decoder = new UbjsonDecoder();

const data = {
  name: 'example',
  numbers: [1, 2, 3],
  nested: {value: 42}
};

const encoded = encoder.encode(data);
const decoded = decoder.decode(encoded);

console.log(decoded); // Original data structure
```

### Alternative: Use simpler codecs

For easier usage without external dependencies, consider using MessagePack or CBOR codecs instead:

```ts
import {MessagePackEncoder, MessagePackDecoder} from '@jsonjoy.com/json-pack/lib/msgpack';
// ... simpler usage
```

## Limitations of the UBJSON format

- Does not have a native "binary" type representation. Instead, octets are
  encoded as a typed arrays of fixed length. Such encoding is reserved for
  JavaScript Typed arrays. The `Uint8Array` array is encoded as fixed length
  fixed type array of type `U`.
- UBJSON requires big-endian encoding of binary data, however, JavaScript
  Typed arrays are always little-endian, because Intel and ARM CPUs are
  little-endian. This means that the binary data must be converted to big-endian
  before encoding and after decoding. To avoid this transcoding performance
  penalty, only `Uint8Array` type is supported.


## Benchmarks

`json-joy` implementation of UBJSON is about an order of magnitude faster than `@shelacek/ubjson`.

### Encoding

Node v20:

```
npx ts-node benchmarks/json-pack/bench.encoding.ubjson.ts
=============================================================================== Benchmark: Encoding
Warmup: 1000x , Node.js: v20.1.0 , Arch: arm64 , CPU: Apple M1
---------------------------------------------------------------------------- Small object, 44 bytes
🤞 json-pack UbjsonEncoder x 6,086,774 ops/sec ±0.49% (99 runs sampled)
🤞 @shelacek/ubjson x 249,763 ops/sec ±0.90% (91 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 2,247,813 ops/sec ±0.09% (100 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
------------------------------------------------------------------------- Typical object, 993 bytes
🤞 json-pack UbjsonEncoder x 467,602 ops/sec ±0.43% (100 runs sampled)
🤞 @shelacek/ubjson x 21,679 ops/sec ±0.63% (93 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 205,665 ops/sec ±0.07% (101 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
-------------------------------------------------------------------------- Large object, 3741 bytes
🤞 json-pack UbjsonEncoder x 139,415 ops/sec ±0.09% (98 runs sampled)
🤞 @shelacek/ubjson x 6,835 ops/sec ±0.75% (80 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 63,793 ops/sec ±0.07% (101 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
-------------------------------------------------------------------- Very large object, 45750 bytes
🤞 json-pack UbjsonEncoder x 6,328 ops/sec ±0.13% (99 runs sampled)
🤞 @shelacek/ubjson x 445 ops/sec ±0.43% (77 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 7,131 ops/sec ±0.44% (99 runs sampled)
Fastest is 🤞 Buffer.from(JSON.stringify())
------------------------------------------------------------------ Object with many keys, 969 bytes
🤞 json-pack UbjsonEncoder x 291,303 ops/sec ±0.78% (99 runs sampled)
🤞 @shelacek/ubjson x 15,442 ops/sec ±1.08% (86 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 183,711 ops/sec ±0.82% (99 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
------------------------------------------------------------------------- String ladder, 3398 bytes
🤞 json-pack UbjsonEncoder x 272,762 ops/sec ±0.56% (93 runs sampled)
🤞 @shelacek/ubjson x 27,051 ops/sec ±1.11% (87 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 145,414 ops/sec ±0.50% (99 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
-------------------------------------------------------------------------- Long strings, 7011 bytes
🤞 json-pack UbjsonEncoder x 424,816 ops/sec ±0.74% (99 runs sampled)
🤞 @shelacek/ubjson x 90,009 ops/sec ±0.69% (93 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 28,931 ops/sec ±0.08% (100 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
-------------------------------------------------------------------------- Short strings, 170 bytes
🤞 json-pack UbjsonEncoder x 2,147,028 ops/sec ±0.23% (99 runs sampled)
🤞 @shelacek/ubjson x 63,720 ops/sec ±0.82% (92 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 1,015,356 ops/sec ±0.12% (99 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
-------------------------------------------------------------------------------- Numbers, 136 bytes
🤞 json-pack UbjsonEncoder x 3,039,077 ops/sec ±0.15% (98 runs sampled)
🤞 @shelacek/ubjson x 381,464 ops/sec ±0.16% (97 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 1,197,582 ops/sec ±0.11% (102 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
--------------------------------------------------------------------------------- Tokens, 308 bytes
🤞 json-pack UbjsonEncoder x 1,661,503 ops/sec ±0.19% (101 runs sampled)
🤞 @shelacek/ubjson x 272,256 ops/sec ±0.11% (101 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 1,075,468 ops/sec ±0.18% (101 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
```

Node v18:

```
npx ts-node benchmarks/json-pack/bench.encoding.ubjson.ts
=============================================================================== Benchmark: Encoding
Warmup: 1000x , Node.js: v18.16.0 , Arch: arm64 , CPU: Apple M1
---------------------------------------------------------------------------- Small object, 44 bytes
🤞 json-pack UbjsonEncoder x 6,702,065 ops/sec ±1.34% (99 runs sampled)
🤞 @shelacek/ubjson x 244,890 ops/sec ±0.83% (88 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 2,272,407 ops/sec ±0.20% (100 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
------------------------------------------------------------------------- Typical object, 993 bytes
🤞 json-pack UbjsonEncoder x 499,534 ops/sec ±0.37% (101 runs sampled)
🤞 @shelacek/ubjson x 21,968 ops/sec ±0.55% (95 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 198,487 ops/sec ±5.53% (90 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
-------------------------------------------------------------------------- Large object, 3741 bytes
🤞 json-pack UbjsonEncoder x 101,614 ops/sec ±6.22% (71 runs sampled)
🤞 @shelacek/ubjson x 6,928 ops/sec ±4.39% (86 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 63,549 ops/sec ±2.57% (95 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
-------------------------------------------------------------------- Very large object, 45750 bytes
🤞 json-pack UbjsonEncoder x 6,548 ops/sec ±0.26% (99 runs sampled)
🤞 @shelacek/ubjson x 441 ops/sec ±1.05% (80 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 5,973 ops/sec ±1.06% (97 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
------------------------------------------------------------------ Object with many keys, 969 bytes
🤞 json-pack UbjsonEncoder x 299,428 ops/sec ±1.96% (95 runs sampled)
🤞 @shelacek/ubjson x 15,818 ops/sec ±1.29% (86 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 188,231 ops/sec ±0.82% (100 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
------------------------------------------------------------------------- String ladder, 3398 bytes
🤞 json-pack UbjsonEncoder x 303,012 ops/sec ±2.13% (97 runs sampled)
🤞 @shelacek/ubjson x 28,397 ops/sec ±1.71% (86 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 126,743 ops/sec ±1.43% (99 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
-------------------------------------------------------------------------- Long strings, 7011 bytes
🤞 json-pack UbjsonEncoder x 434,614 ops/sec ±0.73% (97 runs sampled)
🤞 @shelacek/ubjson x 74,697 ops/sec ±5.70% (91 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 30,070 ops/sec ±0.10% (99 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
-------------------------------------------------------------------------- Short strings, 170 bytes
🤞 json-pack UbjsonEncoder x 1,818,725 ops/sec ±0.64% (98 runs sampled)
🤞 @shelacek/ubjson x 63,728 ops/sec ±1.30% (88 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 1,007,266 ops/sec ±0.59% (100 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
-------------------------------------------------------------------------------- Numbers, 136 bytes
🤞 json-pack UbjsonEncoder x 4,132,602 ops/sec ±0.42% (100 runs sampled)
🤞 @shelacek/ubjson x 361,219 ops/sec ±0.78% (99 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 1,119,393 ops/sec ±0.14% (100 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
--------------------------------------------------------------------------------- Tokens, 308 bytes
🤞 json-pack UbjsonEncoder x 1,907,200 ops/sec ±0.25% (100 runs sampled)
🤞 @shelacek/ubjson x 258,382 ops/sec ±0.52% (100 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 971,885 ops/sec ±0.81% (99 runs sampled)
Fastest is 🤞 json-pack UbjsonEncoder
```

### Decoding

Node v18:

```
npx ts-node benchmarks/json-pack/bench.ubjson.decoding.ts
=============================================================================== Benchmark: Encoding
Warmup: 1000x , Node.js: v18.16.0 , Arch: arm64 , CPU: Apple M1
--------------------------------------------------------------------------- Small object, 331 bytes
👍 json-pack UbjsonDecoder x 2,615,977 ops/sec ±0.16% (101 runs sampled)
👍 @shelacek/ubjson x 536,500 ops/sec ±1.09% (96 runs sampled)
Fastest is 👍 json-pack UbjsonDecoder
------------------------------------------------------------------------ Typical object, 8911 bytes
👍 json-pack UbjsonDecoder x 235,867 ops/sec ±0.29% (100 runs sampled)
👍 @shelacek/ubjson x 56,058 ops/sec ±1.43% (97 runs sampled)
Fastest is 👍 json-pack UbjsonDecoder
------------------------------------------------------------------------- Large object, 36678 bytes
👍 json-pack UbjsonDecoder x 73,598 ops/sec ±0.78% (99 runs sampled)
👍 @shelacek/ubjson x 18,320 ops/sec ±0.58% (99 runs sampled)
Fastest is 👍 json-pack UbjsonDecoder
------------------------------------------------------------------- Very large object, 474391 bytes
👍 json-pack UbjsonDecoder x 3,197 ops/sec ±0.10% (100 runs sampled)
👍 @shelacek/ubjson x 932 ops/sec ±1.42% (98 runs sampled)
Fastest is 👍 json-pack UbjsonDecoder
----------------------------------------------------------------- Object with many keys, 8314 bytes
👍 json-pack UbjsonDecoder x 98,536 ops/sec ±1.03% (98 runs sampled)
👍 @shelacek/ubjson x 35,345 ops/sec ±0.57% (100 runs sampled)
Fastest is 👍 json-pack UbjsonDecoder
------------------------------------------------------------------------ String ladder, 36555 bytes
👍 json-pack UbjsonDecoder x 250,466 ops/sec ±5.04% (93 runs sampled)
👍 @shelacek/ubjson x 68,201 ops/sec ±2.84% (91 runs sampled)
Fastest is 👍 json-pack UbjsonDecoder
------------------------------------------------------------------------- Long strings, 85535 bytes
👍 json-pack UbjsonDecoder x 102,333 ops/sec ±2.35% (96 runs sampled)
👍 @shelacek/ubjson x 79,448 ops/sec ±0.70% (95 runs sampled)
Fastest is 👍 json-pack UbjsonDecoder
------------------------------------------------------------------------- Short strings, 1556 bytes
👍 json-pack UbjsonDecoder x 899,484 ops/sec ±0.44% (96 runs sampled)
👍 @shelacek/ubjson x 156,232 ops/sec ±2.08% (95 runs sampled)
Fastest is 👍 json-pack UbjsonDecoder
-------------------------------------------------------------------------------- Numbers, 790 bytes
👍 json-pack UbjsonDecoder x 3,313,595 ops/sec ±0.14% (99 runs sampled)
👍 @shelacek/ubjson x 430,527 ops/sec ±0.76% (95 runs sampled)
Fastest is 👍 json-pack UbjsonDecoder
--------------------------------------------------------------------------------- Tokens, 471 bytes
👍 json-pack UbjsonDecoder x 1,879,654 ops/sec ±0.20% (95 runs sampled)
👍 @shelacek/ubjson x 322,744 ops/sec ±0.39% (98 runs sampled)
Fastest is 👍 json-pack UbjsonDecoder
```
