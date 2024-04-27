# Benchmark report: **Decoding - JSON CRDT codecs**

> Warmup: 1000x, Node.js: v20.9.0, Arch: x64, CPU: AMD Ryzen 9 3900X 12-Core Processor

## Payload: **Small object, 44 bytes**

- structural > binary (with server clock) x 593,483 ops/sec ±0.51% (92 runs sampled)
- structural > binary (with logical clock) x 429,844 ops/sec ±0.56% (95 runs sampled)
- structural > compact (with server clock) x 414,200 ops/sec ±0.69% (94 runs sampled)
- structural > compact (with logical clock) x 289,773 ops/sec ±0.49% (91 runs sampled)
- structural > verbose (with server clock) x 261,610 ops/sec ±0.68% (95 runs sampled)
- structural > verbose (with logical clock) x 187,051 ops/sec ±0.56% (94 runs sampled)
- indexed (with server clock) x 310,517 ops/sec ±0.38% (95 runs sampled)
- indexed (with logical clock) x 280,304 ops/sec ±0.45% (91 runs sampled)
- sidecar (with server clock) x 314,294 ops/sec ±0.60% (95 runs sampled)
- sidecar (with logical clock) x 280,494 ops/sec ±0.44% (96 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **Typical object, 993 bytes**

- structural > binary (with server clock) x 61,033 ops/sec ±0.36% (93 runs sampled)
- structural > binary (with logical clock) x 46,114 ops/sec ±0.53% (96 runs sampled)
- structural > compact (with server clock) x 42,311 ops/sec ±0.68% (97 runs sampled)
- structural > compact (with logical clock) x 32,729 ops/sec ±0.75% (95 runs sampled)
- structural > verbose (with server clock) x 29,654 ops/sec ±0.42% (97 runs sampled)
- structural > verbose (with logical clock) x 21,085 ops/sec ±0.46% (97 runs sampled)
- indexed (with server clock) x 29,423 ops/sec ±0.43% (95 runs sampled)
- indexed (with logical clock) x 26,806 ops/sec ±0.68% (96 runs sampled)
- sidecar (with server clock) x 35,121 ops/sec ±0.48% (95 runs sampled)
- sidecar (with logical clock) x 32,013 ops/sec ±0.35% (97 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **Large object, 3741 bytes**

- structural > binary (with server clock) x 18,070 ops/sec ±0.52% (95 runs sampled)
- structural > binary (with logical clock) x 13,837 ops/sec ±0.61% (94 runs sampled)
- structural > compact (with server clock) x 12,657 ops/sec ±0.43% (97 runs sampled)
- structural > compact (with logical clock) x 9,907 ops/sec ±0.52% (94 runs sampled)
- structural > verbose (with server clock) x 8,879 ops/sec ±0.52% (97 runs sampled)
- structural > verbose (with logical clock) x 6,525 ops/sec ±0.60% (95 runs sampled)
- indexed (with server clock) x 9,193 ops/sec ±0.50% (97 runs sampled)
- indexed (with logical clock) x 8,435 ops/sec ±0.40% (95 runs sampled)
- sidecar (with server clock) x 10,530 ops/sec ±0.74% (93 runs sampled)
- sidecar (with logical clock) x 9,551 ops/sec ±0.88% (93 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **Very large object, 45750 bytes**

- structural > binary (with server clock) x 739 ops/sec ±0.60% (77 runs sampled)
- structural > binary (with logical clock) x 654 ops/sec ±0.56% (92 runs sampled)
- structural > compact (with server clock) x 519 ops/sec ±0.65% (73 runs sampled)
- structural > compact (with logical clock) x 410 ops/sec ±0.76% (73 runs sampled)
- structural > verbose (with server clock) x 422 ops/sec ±0.36% (81 runs sampled)
- structural > verbose (with logical clock) x 319 ops/sec ±0.72% (78 runs sampled)
- indexed (with server clock) x 393 ops/sec ±0.70% (84 runs sampled)
- indexed (with logical clock) x 357 ops/sec ±0.98% (83 runs sampled)
- sidecar (with server clock) x 454 ops/sec ±3.02% (89 runs sampled)
- sidecar (with logical clock) x 441 ops/sec ±0.49% (90 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **Object with many keys, 969 bytes**

- structural > binary (with server clock) x 40,694 ops/sec ±1.04% (94 runs sampled)
- structural > binary (with logical clock) x 32,229 ops/sec ±0.44% (95 runs sampled)
- structural > compact (with server clock) x 23,076 ops/sec ±0.60% (92 runs sampled)
- structural > compact (with logical clock) x 18,642 ops/sec ±0.62% (97 runs sampled)
- structural > verbose (with server clock) x 16,955 ops/sec ±0.43% (94 runs sampled)
- structural > verbose (with logical clock) x 13,499 ops/sec ±0.33% (95 runs sampled)
- indexed (with server clock) x 24,682 ops/sec ±0.27% (98 runs sampled)
- indexed (with logical clock) x 22,084 ops/sec ±0.55% (93 runs sampled)
- sidecar (with server clock) x 21,077 ops/sec ±0.53% (93 runs sampled)
- sidecar (with logical clock) x 19,021 ops/sec ±0.83% (92 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **String ladder, 4037 bytes**

- structural > binary (with server clock) x 23,500 ops/sec ±0.57% (91 runs sampled)
- structural > binary (with logical clock) x 19,014 ops/sec ±0.61% (95 runs sampled)
- structural > compact (with server clock) x 18,044 ops/sec ±0.85% (87 runs sampled)
- structural > compact (with logical clock) x 14,201 ops/sec ±0.83% (89 runs sampled)
- structural > verbose (with server clock) x 13,522 ops/sec ±0.70% (90 runs sampled)
- structural > verbose (with logical clock) x 10,373 ops/sec ±0.92% (87 runs sampled)
- indexed (with server clock) x 14,446 ops/sec ±2.31% (93 runs sampled)
- indexed (with logical clock) x 12,934 ops/sec ±0.45% (94 runs sampled)
- sidecar (with server clock) x 18,034 ops/sec ±0.53% (90 runs sampled)
- sidecar (with logical clock) x 16,657 ops/sec ±0.37% (96 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **Long strings, 7011 bytes**

- structural > binary (with server clock) x 62,422 ops/sec ±0.31% (96 runs sampled)
- structural > binary (with logical clock) x 54,339 ops/sec ±1.89% (95 runs sampled)
- structural > compact (with server clock) x 56,540 ops/sec ±0.43% (93 runs sampled)
- structural > compact (with logical clock) x 49,568 ops/sec ±0.34% (99 runs sampled)
- structural > verbose (with server clock) x 45,736 ops/sec ±0.53% (96 runs sampled)
- structural > verbose (with logical clock) x 38,509 ops/sec ±1.86% (97 runs sampled)
- indexed (with server clock) x 50,096 ops/sec ±0.53% (97 runs sampled)
- indexed (with logical clock) x 45,671 ops/sec ±0.42% (95 runs sampled)
- sidecar (with server clock) x 53,273 ops/sec ±0.26% (96 runs sampled)
- sidecar (with logical clock) x 50,869 ops/sec ±0.52% (94 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **Short strings, 170 bytes**

- structural > binary (with server clock) x 104,880 ops/sec ±2.38% (96 runs sampled)
- structural > binary (with logical clock) x 78,999 ops/sec ±0.48% (97 runs sampled)
- structural > compact (with server clock) x 77,590 ops/sec ±0.49% (95 runs sampled)
- structural > compact (with logical clock) x 58,813 ops/sec ±0.55% (91 runs sampled)
- structural > verbose (with server clock) x 51,041 ops/sec ±2.11% (92 runs sampled)
- structural > verbose (with logical clock) x 37,296 ops/sec ±0.56% (97 runs sampled)
- indexed (with server clock) x 61,172 ops/sec ±0.49% (94 runs sampled)
- indexed (with logical clock) x 52,729 ops/sec ±0.46% (96 runs sampled)
- sidecar (with server clock) x 67,338 ops/sec ±2.29% (92 runs sampled)
- sidecar (with logical clock) x 60,118 ops/sec ±0.48% (93 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **Numbers, 331 bytes**

- structural > binary (with server clock) x 75,618 ops/sec ±0.35% (95 runs sampled)
- structural > binary (with logical clock) x 62,997 ops/sec ±0.40% (95 runs sampled)
- structural > compact (with server clock) x 56,560 ops/sec ±2.44% (94 runs sampled)
- structural > compact (with logical clock) x 43,040 ops/sec ±0.43% (94 runs sampled)
- structural > verbose (with server clock) x 25,364 ops/sec ±0.41% (95 runs sampled)
- structural > verbose (with logical clock) x 17,191 ops/sec ±0.48% (96 runs sampled)
- indexed (with server clock) x 18,484 ops/sec ±0.74% (95 runs sampled)
- indexed (with logical clock) x 18,466 ops/sec ±2.10% (89 runs sampled)
- sidecar (with server clock) x 34,286 ops/sec ±0.91% (94 runs sampled)
- sidecar (with logical clock) x 34,106 ops/sec ±0.48% (95 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **Tokens, 308 bytes**

- structural > binary (with server clock) x 79,931 ops/sec ±0.91% (88 runs sampled)
- structural > binary (with logical clock) x 66,569 ops/sec ±2.66% (90 runs sampled)
- structural > compact (with server clock) x 58,406 ops/sec ±0.40% (95 runs sampled)
- structural > compact (with logical clock) x 43,026 ops/sec ±0.70% (93 runs sampled)
- structural > verbose (with server clock) x 26,469 ops/sec ±0.51% (97 runs sampled)
- structural > verbose (with logical clock) x 18,978 ops/sec ±0.40% (97 runs sampled)
- indexed (with server clock) x 19,978 ops/sec ±2.04% (93 runs sampled)
- indexed (with logical clock) x 19,606 ops/sec ±0.35% (94 runs sampled)
- sidecar (with server clock) x 37,479 ops/sec ±0.66% (93 runs sampled)
- sidecar (with logical clock) x 36,804 ops/sec ±2.41% (94 runs sampled)

Fastest is **structural > binary (with server clock)**
