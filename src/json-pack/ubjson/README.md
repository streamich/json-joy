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

Encoding:

```
npx ts-node benchmarks/json-pack/bench.encoding.ubjson.ts
=============================================================================== Benchmark: Encoding
Warmup: 1000x , Node.js: v20.1.0 , Arch: arm64 , CPU: Apple M1
---------------------------------------------------------------------------- Small object, 44 bytes
🤞 json-joy/json-pack UbjsonEncoder x 6,086,774 ops/sec ±0.49% (99 runs sampled)
🤞 @shelacek/ubjson x 249,763 ops/sec ±0.90% (91 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 2,247,813 ops/sec ±0.09% (100 runs sampled)
Fastest is 🤞 json-joy/json-pack UbjsonEncoder
------------------------------------------------------------------------- Typical object, 993 bytes
🤞 json-joy/json-pack UbjsonEncoder x 467,602 ops/sec ±0.43% (100 runs sampled)
🤞 @shelacek/ubjson x 21,679 ops/sec ±0.63% (93 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 205,665 ops/sec ±0.07% (101 runs sampled)
Fastest is 🤞 json-joy/json-pack UbjsonEncoder
-------------------------------------------------------------------------- Large object, 3741 bytes
🤞 json-joy/json-pack UbjsonEncoder x 139,415 ops/sec ±0.09% (98 runs sampled)
🤞 @shelacek/ubjson x 6,835 ops/sec ±0.75% (80 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 63,793 ops/sec ±0.07% (101 runs sampled)
Fastest is 🤞 json-joy/json-pack UbjsonEncoder
-------------------------------------------------------------------- Very large object, 45750 bytes
🤞 json-joy/json-pack UbjsonEncoder x 6,328 ops/sec ±0.13% (99 runs sampled)
🤞 @shelacek/ubjson x 445 ops/sec ±0.43% (77 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 7,131 ops/sec ±0.44% (99 runs sampled)
Fastest is 🤞 Buffer.from(JSON.stringify())
------------------------------------------------------------------ Object with many keys, 969 bytes
🤞 json-joy/json-pack UbjsonEncoder x 291,303 ops/sec ±0.78% (99 runs sampled)
🤞 @shelacek/ubjson x 15,442 ops/sec ±1.08% (86 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 183,711 ops/sec ±0.82% (99 runs sampled)
Fastest is 🤞 json-joy/json-pack UbjsonEncoder
------------------------------------------------------------------------- String ladder, 3398 bytes
🤞 json-joy/json-pack UbjsonEncoder x 272,762 ops/sec ±0.56% (93 runs sampled)
🤞 @shelacek/ubjson x 27,051 ops/sec ±1.11% (87 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 145,414 ops/sec ±0.50% (99 runs sampled)
Fastest is 🤞 json-joy/json-pack UbjsonEncoder
-------------------------------------------------------------------------- Long strings, 7011 bytes
🤞 json-joy/json-pack UbjsonEncoder x 424,816 ops/sec ±0.74% (99 runs sampled)
🤞 @shelacek/ubjson x 90,009 ops/sec ±0.69% (93 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 28,931 ops/sec ±0.08% (100 runs sampled)
Fastest is 🤞 json-joy/json-pack UbjsonEncoder
-------------------------------------------------------------------------- Short strings, 170 bytes
🤞 json-joy/json-pack UbjsonEncoder x 2,147,028 ops/sec ±0.23% (99 runs sampled)
🤞 @shelacek/ubjson x 63,720 ops/sec ±0.82% (92 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 1,015,356 ops/sec ±0.12% (99 runs sampled)
Fastest is 🤞 json-joy/json-pack UbjsonEncoder
-------------------------------------------------------------------------------- Numbers, 136 bytes
🤞 json-joy/json-pack UbjsonEncoder x 3,039,077 ops/sec ±0.15% (98 runs sampled)
🤞 @shelacek/ubjson x 381,464 ops/sec ±0.16% (97 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 1,197,582 ops/sec ±0.11% (102 runs sampled)
Fastest is 🤞 json-joy/json-pack UbjsonEncoder
--------------------------------------------------------------------------------- Tokens, 308 bytes
🤞 json-joy/json-pack UbjsonEncoder x 1,661,503 ops/sec ±0.19% (101 runs sampled)
🤞 @shelacek/ubjson x 272,256 ops/sec ±0.11% (101 runs sampled)
🤞 Buffer.from(JSON.stringify()) x 1,075,468 ops/sec ±0.18% (101 runs sampled)
Fastest is 🤞 json-joy/json-pack UbjsonEncoder
```
