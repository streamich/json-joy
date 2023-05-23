# `json-pack` CBOR Codec


## Implementation details

- Map keys are treated as strings.
  - To decode a map with non-string keys, use `decoder.readAsMap()` method.
  - When encoding JavaScript `Object`, map keys are encoded as strings.
  - Full encoder supports `Map` object encoding, where keys can be any type.
  - When decoding CBOR, map keys are decoded as strings. If a non-string value
    is encountered, it is decoded and cast to a string.
- Half-precision `f16` floats are decoded to JavaScript `number`, however,
  encoder does not support half-precision floats&mdash;floats are encoded as
  `f32` or `f64`.


## Benchmarks

Encoding:

```
npx ts-node benchmarks/json-pack/bench.encoding.cbor.ts
=============================================================================== Benchmark: Encoding
Warmup: 1000x , Node.js: v20.1.0 , Arch: arm64 , CPU: Apple M1
---------------------------------------------------------------------------- Small object, 44 bytes
🤞 Buffer.from(JSON.stringify()) x 2,339,523 ops/sec ±0.50% (99 runs sampled)
🤞 JSON.stringify() x 3,802,757 ops/sec ±0.17% (100 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 6,132,816 ops/sec ±0.43% (99 runs sampled)
🤞 json-joy/json-pack CborEncoder x 6,248,575 ops/sec ±0.13% (98 runs sampled)
🤞 cbor-x x 4,924,643 ops/sec ±0.31% (99 runs sampled)
🤞 cbor-js x 670,013 ops/sec ±1.51% (80 runs sampled)
🤞 cborg x 777,829 ops/sec ±0.16% (98 runs sampled)
🤞 cbor-sync x 444,785 ops/sec ±3.07% (96 runs sampled)
Fastest is 🤞 json-joy/json-pack CborEncoder
------------------------------------------------------------------------- Typical object, 993 bytes
🤞 Buffer.from(JSON.stringify()) x 208,448 ops/sec ±0.07% (101 runs sampled)
🤞 JSON.stringify() x 335,826 ops/sec ±0.14% (101 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 468,552 ops/sec ±0.31% (96 runs sampled)
🤞 json-joy/json-pack CborEncoder x 446,904 ops/sec ±0.15% (98 runs sampled)
🤞 cbor-x x 400,380 ops/sec ±0.89% (91 runs sampled)
🤞 cbor-js x 109,455 ops/sec ±0.13% (98 runs sampled)
🤞 cborg x 60,584 ops/sec ±0.10% (102 runs sampled)
🤞 cbor-sync x 75,523 ops/sec ±0.21% (96 runs sampled)
Fastest is 🤞 json-joy/json-pack CborEncoderFast
-------------------------------------------------------------------------- Large object, 3741 bytes
🤞 Buffer.from(JSON.stringify()) x 64,232 ops/sec ±0.07% (99 runs sampled)
🤞 JSON.stringify() x 108,186 ops/sec ±0.24% (101 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 135,553 ops/sec ±0.11% (101 runs sampled)
🤞 json-joy/json-pack CborEncoder x 130,092 ops/sec ±0.24% (100 runs sampled)
🤞 cbor-x x 110,045 ops/sec ±0.63% (95 runs sampled)
🤞 cbor-js x 33,044 ops/sec ±0.11% (102 runs sampled)
🤞 cborg x 18,516 ops/sec ±0.13% (101 runs sampled)
🤞 cbor-sync x 25,829 ops/sec ±0.43% (98 runs sampled)
Fastest is 🤞 json-joy/json-pack CborEncoderFast
-------------------------------------------------------------------- Very large object, 45750 bytes
🤞 Buffer.from(JSON.stringify()) x 7,175 ops/sec ±0.76% (98 runs sampled)
🤞 JSON.stringify() x 7,783 ops/sec ±0.51% (101 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 5,759 ops/sec ±0.53% (100 runs sampled)
🤞 json-joy/json-pack CborEncoder x 5,569 ops/sec ±0.43% (100 runs sampled)
🤞 cbor-x x 5,671 ops/sec ±0.71% (94 runs sampled)
🤞 cbor-js x 2,513 ops/sec ±0.40% (100 runs sampled)
🤞 cborg x 818 ops/sec ±1.04% (92 runs sampled)
🤞 cbor-sync x 1,579 ops/sec ±0.34% (98 runs sampled)
Fastest is 🤞 JSON.stringify()
------------------------------------------------------------------ Object with many keys, 969 bytes
🤞 Buffer.from(JSON.stringify()) x 182,418 ops/sec ±0.69% (99 runs sampled)
🤞 JSON.stringify() x 166,880 ops/sec ±5.89% (82 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 276,754 ops/sec ±1.11% (99 runs sampled)
🤞 json-joy/json-pack CborEncoder x 272,113 ops/sec ±0.77% (94 runs sampled)
🤞 cbor-x x 193,156 ops/sec ±0.49% (96 runs sampled)
🤞 cbor-js x 73,180 ops/sec ±0.38% (100 runs sampled)
🤞 cborg x 35,937 ops/sec ±0.19% (95 runs sampled)
🤞 cbor-sync x 53,410 ops/sec ±0.66% (100 runs sampled)
Fastest is 🤞 json-joy/json-pack CborEncoderFast
------------------------------------------------------------------------- String ladder, 3398 bytes
🤞 Buffer.from(JSON.stringify()) x 148,910 ops/sec ±0.24% (98 runs sampled)
🤞 JSON.stringify() x 172,582 ops/sec ±0.06% (102 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 276,018 ops/sec ±0.64% (92 runs sampled)
🤞 json-joy/json-pack CborEncoder x 278,835 ops/sec ±0.85% (92 runs sampled)
🤞 cbor-x x 209,737 ops/sec ±0.44% (95 runs sampled)
🤞 cbor-js x 29,304 ops/sec ±0.15% (101 runs sampled)
🤞 cborg x 61,577 ops/sec ±0.10% (102 runs sampled)
🤞 cbor-sync x 73,548 ops/sec ±2.14% (93 runs sampled)
Fastest is 🤞 json-joy/json-pack CborEncoder,🤞 json-joy/json-pack CborEncoderFast
-------------------------------------------------------------------------- Long strings, 7011 bytes
🤞 Buffer.from(JSON.stringify()) x 28,860 ops/sec ±0.06% (99 runs sampled)
🤞 JSON.stringify() x 59,800 ops/sec ±0.07% (99 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 403,027 ops/sec ±1.97% (93 runs sampled)
🤞 json-joy/json-pack CborEncoder x 415,001 ops/sec ±1.38% (95 runs sampled)
🤞 cbor-x x 364,240 ops/sec ±1.95% (85 runs sampled)
🤞 cbor-js x 13,370 ops/sec ±0.11% (101 runs sampled)
🤞 cborg x 118,723 ops/sec ±0.54% (99 runs sampled)
🤞 cbor-sync x 117,072 ops/sec ±0.17% (94 runs sampled)
Fastest is 🤞 json-joy/json-pack CborEncoder
-------------------------------------------------------------------------- Short strings, 170 bytes
🤞 Buffer.from(JSON.stringify()) x 1,016,012 ops/sec ±0.12% (102 runs sampled)
🤞 JSON.stringify() x 1,828,820 ops/sec ±0.15% (102 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 1,848,409 ops/sec ±0.56% (99 runs sampled)
🤞 json-joy/json-pack CborEncoder x 1,860,103 ops/sec ±0.18% (98 runs sampled)
🤞 cbor-x x 1,360,519 ops/sec ±0.22% (98 runs sampled)
🤞 cbor-js x 367,320 ops/sec ±0.25% (97 runs sampled)
🤞 cborg x 278,084 ops/sec ±0.15% (98 runs sampled)
🤞 cbor-sync x 181,966 ops/sec ±0.17% (92 runs sampled)
Fastest is 🤞 json-joy/json-pack CborEncoder
-------------------------------------------------------------------------------- Numbers, 136 bytes
🤞 Buffer.from(JSON.stringify()) x 1,231,696 ops/sec ±0.15% (100 runs sampled)
🤞 JSON.stringify() x 1,610,733 ops/sec ±0.16% (100 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 2,775,684 ops/sec ±0.17% (101 runs sampled)
🤞 json-joy/json-pack CborEncoder x 3,112,233 ops/sec ±0.18% (100 runs sampled)
🤞 cbor-x x 3,264,422 ops/sec ±0.14% (101 runs sampled)
🤞 cbor-js x 558,877 ops/sec ±1.31% (89 runs sampled)
🤞 cborg x 296,104 ops/sec ±0.14% (100 runs sampled)
🤞 cbor-sync x 379,437 ops/sec ±0.28% (99 runs sampled)
Fastest is 🤞 cbor-x
--------------------------------------------------------------------------------- Tokens, 308 bytes
🤞 Buffer.from(JSON.stringify()) x 1,101,690 ops/sec ±0.17% (98 runs sampled)
🤞 JSON.stringify() x 1,560,523 ops/sec ±0.14% (98 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 1,352,703 ops/sec ±0.24% (96 runs sampled)
🤞 json-joy/json-pack CborEncoder x 1,371,395 ops/sec ±0.24% (101 runs sampled)
🤞 cbor-x x 1,975,990 ops/sec ±0.19% (98 runs sampled)
🤞 cbor-js x 525,540 ops/sec ±1.25% (91 runs sampled)
🤞 cborg x 227,011 ops/sec ±0.15% (98 runs sampled)
🤞 cbor-sync x 418,451 ops/sec ±0.30% (97 runs sampled)
Fastest is 🤞 cbor-x
```
