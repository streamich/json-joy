# `json-stable`

Deterministic `JSON.stringify()`&mdash;sorts object keys before serializing them,
which ensures that semantically the same JSON objects always result in the same
serialized string.

## Benchmarks

```
node benchmarks/json-stable/bench.js
=============================================================================== Benchmark: Encoding
Warmup: 10000x , Node.js: v16.15.0 , Arch: arm64 , CPU: Apple M1 Max
---------------------------------------------------------------------------- Small object, 44 bytes
🤞 json-joy/json-stable x 4,130,140 ops/sec ±0.17% (99 runs sampled)
🤞 JSON.stringify() x 3,720,578 ops/sec ±0.08% (100 runs sampled)
🤞 fastest-stable-stringify x 3,650,469 ops/sec ±0.12% (97 runs sampled)
🤞 safe-stable-stringify x 3,656,376 ops/sec ±0.11% (102 runs sampled)
🤞 fast-stable-stringify x 2,289,078 ops/sec ±0.16% (99 runs sampled)
Fastest is 🤞 json-joy/json-stable
------------------------------------------------------------------------- Typical object, 993 bytes
🤞 json-joy/json-stable x 271,792 ops/sec ±0.11% (97 runs sampled)
🤞 JSON.stringify() x 329,189 ops/sec ±0.17% (100 runs sampled)
🤞 fastest-stable-stringify x 250,476 ops/sec ±0.10% (98 runs sampled)
🤞 safe-stable-stringify x 250,344 ops/sec ±0.13% (97 runs sampled)
🤞 fast-stable-stringify x 145,333 ops/sec ±0.13% (100 runs sampled)
Fastest is 🤞 JSON.stringify()
-------------------------------------------------------------------------- Large object, 3741 bytes
🤞 json-joy/json-stable x 87,207 ops/sec ±0.21% (98 runs sampled)
🤞 JSON.stringify() x 104,461 ops/sec ±0.07% (101 runs sampled)
🤞 fastest-stable-stringify x 78,120 ops/sec ±0.15% (97 runs sampled)
🤞 safe-stable-stringify x 78,004 ops/sec ±0.14% (99 runs sampled)
🤞 fast-stable-stringify x 44,205 ops/sec ±0.12% (100 runs sampled)
Fastest is 🤞 JSON.stringify()
-------------------------------------------------------------------- Very large object, 45750 bytes
🤞 json-joy/json-stable x 3,066 ops/sec ±0.49% (96 runs sampled)
🤞 JSON.stringify() x 7,287 ops/sec ±0.31% (98 runs sampled)
🤞 fastest-stable-stringify x 3,571 ops/sec ±0.27% (101 runs sampled)
🤞 safe-stable-stringify x 3,570 ops/sec ±0.20% (100 runs sampled)
🤞 fast-stable-stringify x 2,350 ops/sec ±0.19% (100 runs sampled)
Fastest is 🤞 JSON.stringify()
------------------------------------------------------------------ Object with many keys, 969 bytes
🤞 json-joy/json-stable x 135,832 ops/sec ±0.32% (91 runs sampled)
🤞 JSON.stringify() x 210,766 ops/sec ±0.13% (100 runs sampled)
🤞 fastest-stable-stringify x 126,728 ops/sec ±0.48% (100 runs sampled)
🤞 safe-stable-stringify x 126,053 ops/sec ±0.33% (94 runs sampled)
🤞 fast-stable-stringify x 87,067 ops/sec ±0.31% (98 runs sampled)
Fastest is 🤞 JSON.stringify()
------------------------------------------------------------------------- String ladder, 3398 bytes
🤞 json-joy/json-stable x 214,171 ops/sec ±0.40% (96 runs sampled)
🤞 JSON.stringify() x 166,437 ops/sec ±0.28% (100 runs sampled)
🤞 fastest-stable-stringify x 211,056 ops/sec ±0.29% (94 runs sampled)
🤞 safe-stable-stringify x 211,825 ops/sec ±0.27% (100 runs sampled)
🤞 fast-stable-stringify x 101,067 ops/sec ±0.19% (95 runs sampled)
Fastest is 🤞 json-joy/json-stable
-------------------------------------------------------------------------- Long strings, 7011 bytes
🤞 json-joy/json-stable x 209,108 ops/sec ±0.18% (101 runs sampled)
🤞 JSON.stringify() x 59,561 ops/sec ±0.23% (100 runs sampled)
🤞 fastest-stable-stringify x 206,419 ops/sec ±0.23% (97 runs sampled)
🤞 safe-stable-stringify x 207,520 ops/sec ±0.24% (98 runs sampled)
🤞 fast-stable-stringify x 57,455 ops/sec ±0.15% (99 runs sampled)
Fastest is 🤞 json-joy/json-stable
-------------------------------------------------------------------------- Short strings, 170 bytes
🤞 json-joy/json-stable x 886,158 ops/sec ±0.27% (98 runs sampled)
🤞 JSON.stringify() x 1,599,663 ops/sec ±0.29% (96 runs sampled)
🤞 fastest-stable-stringify x 874,501 ops/sec ±0.29% (99 runs sampled)
🤞 safe-stable-stringify x 871,319 ops/sec ±0.29% (100 runs sampled)
🤞 fast-stable-stringify x 571,357 ops/sec ±0.26% (100 runs sampled)
Fastest is 🤞 JSON.stringify()
-------------------------------------------------------------------------------- Numbers, 136 bytes
🤞 json-joy/json-stable x 2,251,606 ops/sec ±0.31% (98 runs sampled)
🤞 JSON.stringify() x 1,578,024 ops/sec ±0.22% (99 runs sampled)
🤞 fastest-stable-stringify x 2,248,141 ops/sec ±0.22% (101 runs sampled)
🤞 safe-stable-stringify x 2,229,350 ops/sec ±0.27% (91 runs sampled)
🤞 fast-stable-stringify x 2,430,401 ops/sec ±0.24% (99 runs sampled)
Fastest is 🤞 fast-stable-stringify
--------------------------------------------------------------------------------- Tokens, 308 bytes
🤞 json-joy/json-stable x 989,455 ops/sec ±0.38% (90 runs sampled)
🤞 JSON.stringify() x 1,163,314 ops/sec ±0.16% (95 runs sampled)
🤞 fastest-stable-stringify x 1,564,514 ops/sec ±0.23% (100 runs sampled)
🤞 safe-stable-stringify x 1,575,138 ops/sec ±0.10% (100 runs sampled)
🤞 fast-stable-stringify x 1,132,460 ops/sec ±0.14% (102 runs sampled)
Fastest is 🤞 safe-stable-stringify
```
