# Benchmark report: **Encoding - JSON CRDT codecs**

> Warmup: 1000x, Node.js: v20.9.0, Arch: x64, CPU: AMD Ryzen 9 3900X 12-Core Processor

All structural encoding return `Uint8Array` as their result. The "compact" and "verbose" codecs first encode into POJO which then is encoded into binary using the CBOR encoder.

The indexed encoding returns a map of `Uint8Array` values.

## Payload: **Small object, 44 bytes**

- structural > binary (with server clock) x 1,722,625 ops/sec ±0.41% (95 runs sampled)
- structural > binary (with logical clock) x 928,031 ops/sec ±1.57% (90 runs sampled)
- structural > compact (with server clock) x 699,487 ops/sec ±0.50% (95 runs sampled)
- structural > compact (with logical clock) x 360,067 ops/sec ±1.17% (92 runs sampled)
- structural > verbose (with server clock) x 359,461 ops/sec ±1.15% (94 runs sampled)
- structural > verbose (with logical clock) x 200,591 ops/sec ±0.65% (92 runs sampled)
- indexed (with server clock) x 549,044 ops/sec ±0.37% (95 runs sampled)
- indexed (with logical clock) x 499,665 ops/sec ±0.62% (90 runs sampled)
- sidecar (with server clock) x 858,504 ops/sec ±2.23% (86 runs sampled)
- sidecar (with logical clock) x 772,138 ops/sec ±2.04% (89 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **Typical object, 993 bytes**

- structural > binary (with server clock) x 158,514 ops/sec ±0.58% (94 runs sampled)
- structural > binary (with logical clock) x 108,126 ops/sec ±0.76% (89 runs sampled)
- structural > compact (with server clock) x 59,682 ops/sec ±0.51% (95 runs sampled)
- structural > compact (with logical clock) x 43,284 ops/sec ±0.58% (89 runs sampled)
- structural > verbose (with server clock) x 39,714 ops/sec ±0.67% (94 runs sampled)
- structural > verbose (with logical clock) x 22,696 ops/sec ±0.58% (94 runs sampled)
- indexed (with server clock) x 43,813 ops/sec ±0.43% (96 runs sampled)
- indexed (with logical clock) x 41,889 ops/sec ±0.57% (94 runs sampled)
- sidecar (with server clock) x 97,099 ops/sec ±1.21% (91 runs sampled)
- sidecar (with logical clock) x 89,428 ops/sec ±0.51% (93 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **Large object, 3741 bytes**

- structural > binary (with server clock) x 46,515 ops/sec ±0.51% (95 runs sampled)
- structural > binary (with logical clock) x 34,240 ops/sec ±0.86% (92 runs sampled)
- structural > compact (with server clock) x 19,798 ops/sec ±0.57% (92 runs sampled)
- structural > compact (with logical clock) x 14,717 ops/sec ±0.43% (97 runs sampled)
- structural > verbose (with server clock) x 12,846 ops/sec ±0.73% (92 runs sampled)
- structural > verbose (with logical clock) x 7,615 ops/sec ±0.75% (94 runs sampled)
- indexed (with server clock) x 15,103 ops/sec ±0.60% (89 runs sampled)
- indexed (with logical clock) x 14,204 ops/sec ±0.55% (93 runs sampled)
- sidecar (with server clock) x 30,281 ops/sec ±0.56% (94 runs sampled)
- sidecar (with logical clock) x 28,310 ops/sec ±0.43% (94 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **Very large object, 45750 bytes**

- structural > binary (with server clock) x 1,909 ops/sec ±0.81% (95 runs sampled)
- structural > binary (with logical clock) x 1,520 ops/sec ±0.72% (94 runs sampled)
- structural > compact (with server clock) x 827 ops/sec ±0.48% (88 runs sampled)
- structural > compact (with logical clock) x 649 ops/sec ±0.54% (88 runs sampled)
- structural > verbose (with server clock) x 625 ops/sec ±0.56% (88 runs sampled)
- structural > verbose (with logical clock) x 363 ops/sec ±0.69% (88 runs sampled)
- indexed (with server clock) x 580 ops/sec ±1.35% (90 runs sampled)
- indexed (with logical clock) x 557 ops/sec ±1.55% (90 runs sampled)
- sidecar (with server clock) x 1,077 ops/sec ±1.32% (92 runs sampled)
- sidecar (with logical clock) x 1,044 ops/sec ±0.43% (91 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **Object with many keys, 969 bytes**

- structural > binary (with server clock) x 134,264 ops/sec ±1.92% (93 runs sampled)
- structural > binary (with logical clock) x 87,215 ops/sec ±1.38% (91 runs sampled)
- structural > compact (with server clock) x 38,467 ops/sec ±0.45% (97 runs sampled)
- structural > compact (with logical clock) x 29,416 ops/sec ±0.33% (94 runs sampled)
- structural > verbose (with server clock) x 27,509 ops/sec ±0.33% (95 runs sampled)
- structural > verbose (with logical clock) x 17,521 ops/sec ±0.49% (99 runs sampled)
- indexed (with server clock) x 39,893 ops/sec ±0.36% (88 runs sampled)
- indexed (with logical clock) x 38,021 ops/sec ±0.36% (97 runs sampled)
- sidecar (with server clock) x 78,311 ops/sec ±0.60% (97 runs sampled)
- sidecar (with logical clock) x 69,181 ops/sec ±0.75% (92 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **String ladder, 4037 bytes**

- structural > binary (with server clock) x 76,416 ops/sec ±0.37% (93 runs sampled)
- structural > binary (with logical clock) x 60,454 ops/sec ±0.51% (98 runs sampled)
- structural > compact (with server clock) x 43,723 ops/sec ±0.51% (93 runs sampled)
- structural > compact (with logical clock) x 27,881 ops/sec ±0.40% (94 runs sampled)
- structural > verbose (with server clock) x 25,408 ops/sec ±0.42% (94 runs sampled)
- structural > verbose (with logical clock) x 13,715 ops/sec ±0.57% (96 runs sampled)
- indexed (with server clock) x 28,067 ops/sec ±0.44% (94 runs sampled)
- indexed (with logical clock) x 26,523 ops/sec ±0.59% (95 runs sampled)
- sidecar (with server clock) x 63,094 ops/sec ±1.26% (94 runs sampled)
- sidecar (with logical clock) x 59,160 ops/sec ±0.46% (96 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **Long strings, 7011 bytes**

- structural > binary (with server clock) x 188,044 ops/sec ±0.29% (95 runs sampled)
- structural > binary (with logical clock) x 156,636 ops/sec ±0.69% (94 runs sampled)
- structural > compact (with server clock) x 143,449 ops/sec ±0.48% (96 runs sampled)
- structural > compact (with logical clock) x 105,801 ops/sec ±0.41% (95 runs sampled)
- structural > verbose (with server clock) x 97,104 ops/sec ±0.43% (94 runs sampled)
- structural > verbose (with logical clock) x 59,677 ops/sec ±0.51% (96 runs sampled)
- indexed (with server clock) x 114,168 ops/sec ±0.30% (97 runs sampled)
- indexed (with logical clock) x 110,234 ops/sec ±0.51% (94 runs sampled)
- sidecar (with server clock) x 152,649 ops/sec ±1.64% (88 runs sampled)
- sidecar (with logical clock) x 150,110 ops/sec ±0.54% (95 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **Short strings, 170 bytes**

- structural > binary (with server clock) x 420,564 ops/sec ±0.31% (99 runs sampled)
- structural > binary (with logical clock) x 246,103 ops/sec ±1.99% (90 runs sampled)
- structural > compact (with server clock) x 178,323 ops/sec ±0.46% (93 runs sampled)
- structural > compact (with logical clock) x 96,353 ops/sec ±1.03% (94 runs sampled)
- structural > verbose (with server clock) x 91,203 ops/sec ±0.35% (94 runs sampled)
- structural > verbose (with logical clock) x 44,389 ops/sec ±0.58% (95 runs sampled)
- indexed (with server clock) x 92,967 ops/sec ±0.48% (96 runs sampled)
- indexed (with logical clock) x 90,840 ops/sec ±0.41% (94 runs sampled)
- sidecar (with server clock) x 283,902 ops/sec ±0.80% (96 runs sampled)
- sidecar (with logical clock) x 216,511 ops/sec ±1.97% (90 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **Numbers, 331 bytes**

- structural > binary (with server clock) x 153,776 ops/sec ±0.89% (95 runs sampled)
- structural > binary (with logical clock) x 79,630 ops/sec ±1.00% (91 runs sampled)
- structural > compact (with server clock) x 68,430 ops/sec ±0.63% (94 runs sampled)
- structural > compact (with logical clock) x 38,306 ops/sec ±1.03% (92 runs sampled)
- structural > verbose (with server clock) x 33,313 ops/sec ±0.36% (95 runs sampled)
- structural > verbose (with logical clock) x 15,650 ops/sec ±0.85% (91 runs sampled)
- indexed (with server clock) x 21,524 ops/sec ±0.68% (94 runs sampled)
- indexed (with logical clock) x 20,364 ops/sec ±0.61% (90 runs sampled)
- sidecar (with server clock) x 95,843 ops/sec ±0.69% (96 runs sampled)
- sidecar (with logical clock) x 69,320 ops/sec ±1.00% (90 runs sampled)

Fastest is **structural > binary (with server clock)**

## Payload: **Tokens, 308 bytes**

- structural > binary (with server clock) x 182,602 ops/sec ±0.49% (91 runs sampled)
- structural > binary (with logical clock) x 92,052 ops/sec ±2.10% (86 runs sampled)
- structural > compact (with server clock) x 80,236 ops/sec ±0.52% (93 runs sampled)
- structural > compact (with logical clock) x 42,345 ops/sec ±1.07% (89 runs sampled)
- structural > verbose (with server clock) x 36,837 ops/sec ±0.51% (97 runs sampled)
- structural > verbose (with logical clock) x 17,516 ops/sec ±0.60% (95 runs sampled)
- indexed (with server clock) x 23,993 ops/sec ±0.76% (89 runs sampled)
- indexed (with logical clock) x 22,835 ops/sec ±0.57% (92 runs sampled)
- sidecar (with server clock) x 110,813 ops/sec ±0.64% (98 runs sampled)
- sidecar (with logical clock) x 70,557 ops/sec ±1.66% (83 runs sampled)

Fastest is **structural > binary (with server clock)**
