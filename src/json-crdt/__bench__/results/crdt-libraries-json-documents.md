# Benchmark report: **CRDT libraries JSON documents**

> Warmup: 1000x, Node.js: v20.9.0, Arch: x64, CPU: AMD Ryzen 9 3900X 12-Core Processor

This benchmarks tests encoding speed of various JSON documents by CRDT libraries.

This benchmark constructs a JSON document and serializes its model. For libraries, that cannot serialize just the model, the whole document is serialized.

## Payload: **Small object, 44 bytes**

- Native JavaScript x 598,722 ops/sec ±0.31% (95 runs sampled)
- json-joy x 196,930 ops/sec ±0.54% (92 runs sampled)

Fastest is **Native JavaScript**

## Payload: **Typical object, 993 bytes**

- Native JavaScript x 73,548 ops/sec ±0.54% (95 runs sampled)
- json-joy x 22,191 ops/sec ±2.35% (91 runs sampled)

Fastest is **Native JavaScript**

## Payload: **Large object, 3741 bytes**

- Native JavaScript x 23,661 ops/sec ±0.35% (96 runs sampled)
- json-joy x 7,116 ops/sec ±0.48% (90 runs sampled)

Fastest is **Native JavaScript**

## Payload: **Very large object, 45750 bytes**

- Native JavaScript x 1,513 ops/sec ±0.43% (96 runs sampled)
- json-joy x 319 ops/sec ±0.64% (86 runs sampled)

Fastest is **Native JavaScript**

## Payload: **Object with many keys, 969 bytes**

- Native JavaScript x 81,338 ops/sec ±0.39% (94 runs sampled)
- json-joy x 16,977 ops/sec ±1.09% (96 runs sampled)

Fastest is **Native JavaScript**

## Payload: **String ladder, 4037 bytes**

- Native JavaScript x 31,679 ops/sec ±0.40% (95 runs sampled)
- json-joy x 12,225 ops/sec ±0.49% (91 runs sampled)

Fastest is **Native JavaScript**

## Payload: **Long strings, 7011 bytes**

- Native JavaScript x 16,444 ops/sec ±1.30% (95 runs sampled)
- json-joy x 36,960 ops/sec ±1.07% (95 runs sampled)

Fastest is **json-joy**

## Payload: **Short strings, 170 bytes**

- Native JavaScript x 313,289 ops/sec ±0.30% (97 runs sampled)
- json-joy x 47,837 ops/sec ±0.44% (96 runs sampled)

Fastest is **Native JavaScript**

## Payload: **Numbers, 331 bytes**

- Native JavaScript x 265,663 ops/sec ±0.45% (97 runs sampled)
- json-joy x 23,803 ops/sec ±1.38% (93 runs sampled)

Fastest is **Native JavaScript**

## Payload: **Tokens, 308 bytes**

- Native JavaScript x 391,244 ops/sec ±0.61% (96 runs sampled)
- json-joy x 27,932 ops/sec ±0.32% (99 runs sampled)

Fastest is **Native JavaScript**
