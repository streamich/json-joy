# Benchmark report: __Encoding JSON documents__

> Warmup: 1000x, Node.js: v20.8.0, Arch: arm64, CPU: Apple M1

This benchmarks tests encoding speed of JSON various JSON documents. It constructs a CRDT model from the JSON document and then encodes the model to binary.

CRDT models are compared against native CBOR encoder and Node.js native `Buffer.from(JSON.stringify(obj))` plain object encoding to binary.

Model "with logical" uses logical clock to timestamp CRDT operations. Model "with server" clock ignores the *session ID* part of logical timestamps, as those are always constant.


## Payload: __Combined, 63365 bytes__

- json-joy/json-pack CborEncoder x 4,467 ops/sec ±4.26% (93 runs sampled)
- Buffer.from(JSON.stringify(json)) x 3,097 ops/sec ±0.44% (100 runs sampled)
- Model.toBinary() - with logical clock x 1,825 ops/sec ±0.60% (98 runs sampled)
- Model.toBinary() - with server clock x 2,157 ops/sec ±0.18% (100 runs sampled)

Fastest is __json-joy/json-pack CborEncoder__


## Payload: __Small object, 44 bytes__

- json-joy/json-pack CborEncoder x 5,717,899 ops/sec ±0.14% (99 runs sampled)
- Buffer.from(JSON.stringify(json)) x 2,318,721 ops/sec ±0.15% (99 runs sampled)
- Model.toBinary() - with logical clock x 1,535,479 ops/sec ±1.67% (90 runs sampled)
- Model.toBinary() - with server clock x 2,748,572 ops/sec ±0.13% (100 runs sampled)

Fastest is __json-joy/json-pack CborEncoder__


## Payload: __Typical object, 993 bytes__

- json-joy/json-pack CborEncoder x 448,173 ops/sec ±0.17% (98 runs sampled)
- Buffer.from(JSON.stringify(json)) x 201,839 ops/sec ±0.24% (100 runs sampled)
- Model.toBinary() - with logical clock x 181,456 ops/sec ±1.12% (99 runs sampled)
- Model.toBinary() - with server clock x 244,232 ops/sec ±1.00% (97 runs sampled)

Fastest is __json-joy/json-pack CborEncoder__


## Payload: __Large object, 3741 bytes__

- json-joy/json-pack CborEncoder x 125,777 ops/sec ±1.18% (97 runs sampled)
- Buffer.from(JSON.stringify(json)) x 56,376 ops/sec ±3.92% (92 runs sampled)
- Model.toBinary() - with logical clock x 51,509 ops/sec ±1.78% (91 runs sampled)
- Model.toBinary() - with server clock x 71,107 ops/sec ±1.52% (95 runs sampled)

Fastest is __json-joy/json-pack CborEncoder__


## Payload: __Very large object, 45750 bytes__

- json-joy/json-pack CborEncoder x 5,407 ops/sec ±1.09% (95 runs sampled)
- Buffer.from(JSON.stringify(json)) x 7,096 ops/sec ±0.54% (98 runs sampled)
- Model.toBinary() - with logical clock x 2,258 ops/sec ±0.62% (98 runs sampled)
- Model.toBinary() - with server clock x 2,546 ops/sec ±1.96% (96 runs sampled)

Fastest is __Buffer.from(JSON.stringify(json))__


## Payload: __Object with many keys, 969 bytes__

- json-joy/json-pack CborEncoder x 254,513 ops/sec ±1.86% (96 runs sampled)
- Buffer.from(JSON.stringify(json)) x 180,325 ops/sec ±1.39% (96 runs sampled)
- Model.toBinary() - with logical clock x 145,715 ops/sec ±1.11% (97 runs sampled)
- Model.toBinary() - with server clock x 191,111 ops/sec ±0.33% (97 runs sampled)

Fastest is __json-joy/json-pack CborEncoder__


## Payload: __String ladder, 4037 bytes__

- json-joy/json-pack CborEncoder x 208,391 ops/sec ±0.43% (98 runs sampled)
- Buffer.from(JSON.stringify(json)) x 56,672 ops/sec ±0.26% (100 runs sampled)
- Model.toBinary() - with logical clock x 91,439 ops/sec ±0.46% (97 runs sampled)
- Model.toBinary() - with server clock x 120,786 ops/sec ±0.20% (100 runs sampled)

Fastest is __json-joy/json-pack CborEncoder__


## Payload: __Long strings, 7011 bytes__

- json-joy/json-pack CborEncoder x 413,257 ops/sec ±0.35% (99 runs sampled)
- Buffer.from(JSON.stringify(json)) x 28,525 ops/sec ±0.09% (100 runs sampled)
- Model.toBinary() - with logical clock x 268,610 ops/sec ±0.78% (95 runs sampled)
- Model.toBinary() - with server clock x 320,624 ops/sec ±0.27% (96 runs sampled)

Fastest is __json-joy/json-pack CborEncoder__


## Payload: __Short strings, 170 bytes__

- json-joy/json-pack CborEncoder x 2,094,950 ops/sec ±0.99% (95 runs sampled)
- Buffer.from(JSON.stringify(json)) x 975,821 ops/sec ±0.28% (101 runs sampled)
- Model.toBinary() - with logical clock x 386,182 ops/sec ±0.89% (95 runs sampled)
- Model.toBinary() - with server clock x 563,510 ops/sec ±0.40% (96 runs sampled)

Fastest is __json-joy/json-pack CborEncoder__


## Payload: __Numbers, 331 bytes__

- json-joy/json-pack CborEncoder x 1,337,559 ops/sec ±0.21% (97 runs sampled)
- Buffer.from(JSON.stringify(json)) x 668,945 ops/sec ±0.19% (99 runs sampled)
- Model.toBinary() - with logical clock x 133,259 ops/sec ±0.65% (98 runs sampled)
- Model.toBinary() - with server clock x 199,236 ops/sec ±0.55% (96 runs sampled)

Fastest is __json-joy/json-pack CborEncoder__


## Payload: __Tokens, 308 bytes__

- json-joy/json-pack CborEncoder x 1,621,012 ops/sec ±0.40% (100 runs sampled)
- Buffer.from(JSON.stringify(json)) x 1,069,240 ops/sec ±0.20% (101 runs sampled)
- Model.toBinary() - with logical clock x 154,222 ops/sec ±0.22% (95 runs sampled)
- Model.toBinary() - with server clock x 224,114 ops/sec ±0.38% (98 runs sampled)

Fastest is __json-joy/json-pack CborEncoder__

