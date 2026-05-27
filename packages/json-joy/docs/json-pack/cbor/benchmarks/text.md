`json-pack` aims to implement the fastest CBOR code in NPM ecosystem. Below you can
see the benchmark results comparing `json-joy` against other CBOR packages.

Overall, `json-pack` is much faster than all other packages, except `cbor-x` which
comes close to `json-pack`, but still slower.


### Encoding

Below table compares CBOR encoding performance of `json-joy` against `cbor-x`, `cborg`, and `cbor` packages.

![cbor-encoding-benchmark-results](https://appsets.jsonjoy.com/libraries/json-joy-js/json-pack/cbor-encoding-results.png)


### Decoding

Below table compares CBOR decoding performance of `json-joy` against `cbor-x`, `cborg`, and `cbor` packages.

![cbor-decoding-benchmark-results](https://appsets.jsonjoy.com/libraries/json-joy-js/json-pack/cbor-decoding-results.png)


### More details

More benchmark results in raw text format below.


#### Encoding

```
npx ts-node benchmarks/json-pack/bench.encoding.cbor.ts
=========================================================== Benchmark: Encoding
Warmup: 1000x , Node.js: v20.1.0 , Arch: arm64 , CPU: Apple M1
-------------------------------------------------------- Small object, 44 bytes
🤞 Buffer.from(JSON.stringify()) x 2,339,523 ops/sec ±0.50% (99 runs sampled)
🤞 JSON.stringify() x 3,802,757 ops/sec ±0.17% (100 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 6,132,816 ops/sec ±0.43% (99 runs sampled)
🤞 json-joy/json-pack CborEncoder x 6,248,575 ops/sec ±0.13% (98 runs sampled)
🤞 cbor-x x 4,924,643 ops/sec ±0.31% (99 runs sampled)
🤞 cbor-js x 670,013 ops/sec ±1.51% (80 runs sampled)
🤞 cborg x 777,829 ops/sec ±0.16% (98 runs sampled)
🤞 cbor-sync x 444,785 ops/sec ±3.07% (96 runs sampled)
Fastest is 🤞 json-joy/json-pack CborEncoder
----------------------------------------------------- Typical object, 993 bytes
🤞 Buffer.from(JSON.stringify()) x 208,448 ops/sec ±0.07% (101 runs sampled)
🤞 JSON.stringify() x 335,826 ops/sec ±0.14% (101 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 468,552 ops/sec ±0.31% (96 runs sampled)
🤞 json-joy/json-pack CborEncoder x 446,904 ops/sec ±0.15% (98 runs sampled)
🤞 cbor-x x 400,380 ops/sec ±0.89% (91 runs sampled)
🤞 cbor-js x 109,455 ops/sec ±0.13% (98 runs sampled)
🤞 cborg x 60,584 ops/sec ±0.10% (102 runs sampled)
🤞 cbor-sync x 75,523 ops/sec ±0.21% (96 runs sampled)
Fastest is 🤞 json-joy/json-pack CborEncoderFast
------------------------------------------------------ Large object, 3741 bytes
🤞 Buffer.from(JSON.stringify()) x 64,232 ops/sec ±0.07% (99 runs sampled)
🤞 JSON.stringify() x 108,186 ops/sec ±0.24% (101 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 135,553 ops/sec ±0.11% (101 runs sampled)
🤞 json-joy/json-pack CborEncoder x 130,092 ops/sec ±0.24% (100 runs sampled)
🤞 cbor-x x 110,045 ops/sec ±0.63% (95 runs sampled)
🤞 cbor-js x 33,044 ops/sec ±0.11% (102 runs sampled)
🤞 cborg x 18,516 ops/sec ±0.13% (101 runs sampled)
🤞 cbor-sync x 25,829 ops/sec ±0.43% (98 runs sampled)
Fastest is 🤞 json-joy/json-pack CborEncoderFast
------------------------------------------------ Very large object, 45750 bytes
🤞 Buffer.from(JSON.stringify()) x 7,175 ops/sec ±0.76% (98 runs sampled)
🤞 JSON.stringify() x 7,783 ops/sec ±0.51% (101 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 5,759 ops/sec ±0.53% (100 runs sampled)
🤞 json-joy/json-pack CborEncoder x 5,569 ops/sec ±0.43% (100 runs sampled)
🤞 cbor-x x 5,671 ops/sec ±0.71% (94 runs sampled)
🤞 cbor-js x 2,513 ops/sec ±0.40% (100 runs sampled)
🤞 cborg x 818 ops/sec ±1.04% (92 runs sampled)
🤞 cbor-sync x 1,579 ops/sec ±0.34% (98 runs sampled)
Fastest is 🤞 JSON.stringify()
---------------------------------------------- Object with many keys, 969 bytes
🤞 Buffer.from(JSON.stringify()) x 182,418 ops/sec ±0.69% (99 runs sampled)
🤞 JSON.stringify() x 166,880 ops/sec ±5.89% (82 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 276,754 ops/sec ±1.11% (99 runs sampled)
🤞 json-joy/json-pack CborEncoder x 272,113 ops/sec ±0.77% (94 runs sampled)
🤞 cbor-x x 193,156 ops/sec ±0.49% (96 runs sampled)
🤞 cbor-js x 73,180 ops/sec ±0.38% (100 runs sampled)
🤞 cborg x 35,937 ops/sec ±0.19% (95 runs sampled)
🤞 cbor-sync x 53,410 ops/sec ±0.66% (100 runs sampled)
Fastest is 🤞 json-joy/json-pack CborEncoderFast
----------------------------------------------------- String ladder, 3398 bytes
🤞 Buffer.from(JSON.stringify()) x 148,910 ops/sec ±0.24% (98 runs sampled)
🤞 JSON.stringify() x 172,582 ops/sec ±0.06% (102 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 276,018 ops/sec ±0.64% (92 runs sampled)
🤞 json-joy/json-pack CborEncoder x 278,835 ops/sec ±0.85% (92 runs sampled)
🤞 cbor-x x 209,737 ops/sec ±0.44% (95 runs sampled)
🤞 cbor-js x 29,304 ops/sec ±0.15% (101 runs sampled)
🤞 cborg x 61,577 ops/sec ±0.10% (102 runs sampled)
🤞 cbor-sync x 73,548 ops/sec ±2.14% (93 runs sampled)
Fastest is 🤞 json-joy/json-pack CborEncoder,🤞 json-joy/json-pack CborEncoderFast
------------------------------------------------------ Long strings, 7011 bytes
🤞 Buffer.from(JSON.stringify()) x 28,860 ops/sec ±0.06% (99 runs sampled)
🤞 JSON.stringify() x 59,800 ops/sec ±0.07% (99 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 403,027 ops/sec ±1.97% (93 runs sampled)
🤞 json-joy/json-pack CborEncoder x 415,001 ops/sec ±1.38% (95 runs sampled)
🤞 cbor-x x 364,240 ops/sec ±1.95% (85 runs sampled)
🤞 cbor-js x 13,370 ops/sec ±0.11% (101 runs sampled)
🤞 cborg x 118,723 ops/sec ±0.54% (99 runs sampled)
🤞 cbor-sync x 117,072 ops/sec ±0.17% (94 runs sampled)
Fastest is 🤞 json-joy/json-pack CborEncoder
------------------------------------------------------ Short strings, 170 bytes
🤞 Buffer.from(JSON.stringify()) x 1,016,012 ops/sec ±0.12% (102 runs sampled)
🤞 JSON.stringify() x 1,828,820 ops/sec ±0.15% (102 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 1,848,409 ops/sec ±0.56% (99 runs sampled)
🤞 json-joy/json-pack CborEncoder x 1,860,103 ops/sec ±0.18% (98 runs sampled)
🤞 cbor-x x 1,360,519 ops/sec ±0.22% (98 runs sampled)
🤞 cbor-js x 367,320 ops/sec ±0.25% (97 runs sampled)
🤞 cborg x 278,084 ops/sec ±0.15% (98 runs sampled)
🤞 cbor-sync x 181,966 ops/sec ±0.17% (92 runs sampled)
Fastest is 🤞 json-joy/json-pack CborEncoder
------------------------------------------------------------ Numbers, 136 bytes
🤞 Buffer.from(JSON.stringify()) x 1,231,696 ops/sec ±0.15% (100 runs sampled)
🤞 JSON.stringify() x 1,610,733 ops/sec ±0.16% (100 runs sampled)
🤞 json-joy/json-pack CborEncoderFast x 2,775,684 ops/sec ±0.17% (101 runs sampled)
🤞 json-joy/json-pack CborEncoder x 3,112,233 ops/sec ±0.18% (100 runs sampled)
🤞 cbor-x x 3,264,422 ops/sec ±0.14% (101 runs sampled)
🤞 cbor-js x 558,877 ops/sec ±1.31% (89 runs sampled)
🤞 cborg x 296,104 ops/sec ±0.14% (100 runs sampled)
🤞 cbor-sync x 379,437 ops/sec ±0.28% (99 runs sampled)
Fastest is 🤞 cbor-x
------------------------------------------------------------- Tokens, 308 bytes
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

Node 18:

```
npx ts-node benchmarks/json-pack/bench.cbor.encoding.ts
=========================================================== Benchmark: Encoding
Warmup: 1000x , Node.js: v18.16.0 , Arch: arm64 , CPU: Apple M1 Max
-------------------------------------------------------- Small object, 44 bytes
👍 json-joy/json-pack CborEncoderFast x 6,233,741 ops/sec ±0.48% (97 runs sampled)
👍 json-joy/json-pack CborEncoder x 6,284,071 ops/sec ±0.52% (98 runs sampled)
👍 cborg x 593,217 ops/sec ±0.75% (98 runs sampled)
👍 cbor-x x 4,360,950 ops/sec ±0.61% (92 runs sampled)
Fastest is 👍 json-joy/json-pack CborEncoder
----------------------------------------------------- Typical object, 993 bytes
👍 json-joy/json-pack CborEncoderFast x 450,797 ops/sec ±0.43% (94 runs sampled)
👍 json-joy/json-pack CborEncoder x 465,790 ops/sec ±0.39% (97 runs sampled)
👍 cborg x 48,343 ops/sec ±0.57% (99 runs sampled)
👍 cbor-x x 414,580 ops/sec ±0.38% (98 runs sampled)
Fastest is 👍 json-joy/json-pack CborEncoder
------------------------------------------------------ Large object, 3741 bytes
👍 json-joy/json-pack CborEncoderFast x 132,873 ops/sec ±0.37% (99 runs sampled)
👍 json-joy/json-pack CborEncoder x 134,572 ops/sec ±0.49% (96 runs sampled)
👍 cborg x 14,615 ops/sec ±0.59% (96 runs sampled)
👍 cbor-x x 114,106 ops/sec ±0.46% (100 runs sampled)
Fastest is 👍 json-joy/json-pack CborEncoder
------------------------------------------------ Very large object, 45750 bytes
👍 json-joy/json-pack CborEncoderFast x 5,498 ops/sec ±0.60% (97 runs sampled)
👍 json-joy/json-pack CborEncoder x 5,474 ops/sec ±1.15% (94 runs sampled)
👍 cborg x 659 ops/sec ±0.99% (92 runs sampled)
👍 cbor-x x 5,635 ops/sec ±0.76% (96 runs sampled)
Fastest is 👍 cbor-x
---------------------------------------------- Object with many keys, 969 bytes
👍 json-joy/json-pack CborEncoderFast x 279,077 ops/sec ±0.52% (96 runs sampled)
👍 json-joy/json-pack CborEncoder x 279,231 ops/sec ±0.35% (98 runs sampled)
👍 cborg x 26,533 ops/sec ±0.62% (95 runs sampled)
👍 cbor-x x 194,635 ops/sec ±0.58% (95 runs sampled)
Fastest is 👍 json-joy/json-pack CborEncoder,👍 json-joy/json-pack CborEncoderFast
----------------------------------------------------- String ladder, 3398 bytes
👍 json-joy/json-pack CborEncoderFast x 295,817 ops/sec ±0.61% (98 runs sampled)
👍 json-joy/json-pack CborEncoder x 293,260 ops/sec ±0.37% (97 runs sampled)
👍 cborg x 46,351 ops/sec ±0.46% (99 runs sampled)
👍 cbor-x x 221,037 ops/sec ±0.49% (96 runs sampled)
Fastest is 👍 json-joy/json-pack CborEncoderFast
------------------------------------------------------ Long strings, 7011 bytes
👍 json-joy/json-pack CborEncoderFast x 397,191 ops/sec ±1.10% (93 runs sampled)
👍 json-joy/json-pack CborEncoder x 393,080 ops/sec ±0.86% (91 runs sampled)
👍 cborg x 73,491 ops/sec ±0.51% (98 runs sampled)
👍 cbor-x x 386,859 ops/sec ±0.82% (94 runs sampled)
Fastest is 👍 json-joy/json-pack CborEncoderFast
------------------------------------------------------ Short strings, 170 bytes
👍 json-joy/json-pack CborEncoderFast x 1,746,092 ops/sec ±0.40% (98 runs sampled)
👍 json-joy/json-pack CborEncoder x 1,745,521 ops/sec ±0.40% (99 runs sampled)
👍 cborg x 198,683 ops/sec ±0.57% (96 runs sampled)
👍 cbor-x x 1,276,409 ops/sec ±0.62% (93 runs sampled)
Fastest is 👍 json-joy/json-pack CborEncoderFast,👍 json-joy/json-pack CborEncoder
------------------------------------------------------------ Numbers, 136 bytes
👍 json-joy/json-pack CborEncoderFast x 2,558,939 ops/sec ±0.46% (98 runs sampled)
👍 json-joy/json-pack CborEncoder x 2,575,323 ops/sec ±0.39% (95 runs sampled)
👍 cborg x 230,191 ops/sec ±0.40% (98 runs sampled)
👍 cbor-x x 2,966,610 ops/sec ±0.34% (97 runs sampled)
Fastest is 👍 cbor-x
------------------------------------------------------------- Tokens, 308 bytes
👍 json-joy/json-pack CborEncoderFast x 1,318,484 ops/sec ±0.45% (100 runs sampled)
👍 json-joy/json-pack CborEncoder x 1,332,239 ops/sec ±0.40% (100 runs sampled)
👍 cborg x 168,853 ops/sec ±0.42% (96 runs sampled)
👍 cbor-x x 1,824,744 ops/sec ±0.43% (95 runs sampled)
Fastest is 👍 cbor-x
```

#### Decoding

```
npx ts-node benchmarks/json-pack/bench.cbor.decoding.ts
====================================================== Benchmark: CBOR Decoding
Warmup: 1000x , Node.js: v20.2.0 , Arch: arm64 , CPU: Apple M1
-------------------------------------------------------- Combined, 634613 bytes
👍 json-joy/json-pack CborDecoder x 3,869 ops/sec ±0.18% (98 runs sampled)
👎 cbor-x x 3,636 ops/sec ±0.13% (100 runs sampled)
👍 cborg x 1,848 ops/sec ±0.27% (99 runs sampled)
👍 cbor x 313 ops/sec ±0.85% (95 runs sampled)
Fastest is 👍 json-joy/json-pack CborDecoder
------------------------------------------------------- Small object, 274 bytes
👍 json-joy/json-pack CborDecoder x 4,547,927 ops/sec ±0.13% (98 runs sampled)
👍 cbor-x x 4,146,745 ops/sec ±0.15% (94 runs sampled)
👍 cborg x 1,979,229 ops/sec ±0.15% (99 runs sampled)
👍 cbor x 133,271 ops/sec ±2.51% (92 runs sampled)
Fastest is 👍 json-joy/json-pack CborDecoder
---------------------------------------------------- Typical object, 8253 bytes
👍 json-joy/json-pack CborDecoder x 373,571 ops/sec ±0.33% (97 runs sampled)
👍 cbor-x x 254,533 ops/sec ±0.57% (99 runs sampled)
👍 cborg x 121,327 ops/sec ±0.36% (97 runs sampled)
👍 cbor x 19,516 ops/sec ±0.22% (98 runs sampled)
Fastest is 👍 json-joy/json-pack CborDecoder
----------------------------------------------------- Large object, 34563 bytes
👍 json-joy/json-pack CborDecoder x 108,250 ops/sec ±0.70% (96 runs sampled)
👍 cbor-x x 86,146 ops/sec ±0.32% (101 runs sampled)
👍 cborg x 33,641 ops/sec ±0.56% (93 runs sampled)
👍 cbor x 6,383 ops/sec ±0.58% (97 runs sampled)
Fastest is 👍 json-joy/json-pack CborDecoder
----------------------------------------------- Very large object, 437014 bytes
👍 json-joy/json-pack CborDecoder x 4,374 ops/sec ±0.31% (94 runs sampled)
👎 cbor-x x 3,943 ops/sec ±0.30% (98 runs sampled)
👍 cborg x 1,685 ops/sec ±0.29% (79 runs sampled)
👍 cbor x 310 ops/sec ±0.15% (89 runs sampled)
Fastest is 👍 json-joy/json-pack CborDecoder
--------------------------------------------- Object with many keys, 7575 bytes
👍 json-joy/json-pack CborDecoder x 92,625 ops/sec ±0.51% (95 runs sampled)
👎 cbor-x x 91,511 ops/sec ±0.94% (93 runs sampled)
👍 cborg x 54,355 ops/sec ±0.41% (97 runs sampled)
👍 cbor x 13,289 ops/sec ±1.41% (99 runs sampled)
Fastest is 👍 json-joy/json-pack CborDecoder,👎 cbor-x
---------------------------------------------------- String ladder, 35622 bytes
👍 json-joy/json-pack CborDecoder x 240,683 ops/sec ±0.34% (100 runs sampled)
👍 cbor-x x 324,927 ops/sec ±0.40% (96 runs sampled)
👍 cborg x 70,820 ops/sec ±0.58% (95 runs sampled)
👍 cbor x 24,792 ops/sec ±0.76% (96 runs sampled)
Fastest is 👍 cbor-x
----------------------------------------------------- Long strings, 85228 bytes
👍 json-joy/json-pack CborDecoder x 96,957 ops/sec ±0.50% (98 runs sampled)
👍 cbor-x x 94,397 ops/sec ±0.51% (94 runs sampled)
👍 cborg x 69,925 ops/sec ±6.38% (91 runs sampled)
👍 cbor x 34,779 ops/sec ±10.73% (79 runs sampled)
Fastest is 👍 json-joy/json-pack CborDecoder
----------------------------------------------------- Short strings, 1211 bytes
👍 json-joy/json-pack CborDecoder x 1,177,079 ops/sec ±0.61% (94 runs sampled)
👍 cbor-x x 1,070,770 ops/sec ±1.19% (90 runs sampled)
👍 cborg x 385,823 ops/sec ±0.79% (94 runs sampled)
👍 cbor x 53,147 ops/sec ±0.91% (91 runs sampled)
Fastest is 👍 json-joy/json-pack CborDecoder
----------------------------------------------------------- Numbers, 1544 bytes
👍 json-joy/json-pack CborDecoder x 974,821 ops/sec ±0.72% (98 runs sampled)
👍 cbor-x x 1,576,220 ops/sec ±0.68% (95 runs sampled)
👍 cborg x 464,996 ops/sec ±0.44% (94 runs sampled)
👍 cbor x 34,161 ops/sec ±0.76% (92 runs sampled)
Fastest is 👍 cbor-x
------------------------------------------------------------- Tokens, 530 bytes
👍 json-joy/json-pack CborDecoder x 1,198,726 ops/sec ±0.53% (96 runs sampled)
👍 cbor-x x 1,927,307 ops/sec ±0.67% (80 runs sampled)
👍 cborg x 957,531 ops/sec ±0.62% (98 runs sampled)
👍 cbor x 44,276 ops/sec ±10.58% (80 runs sampled)
Fastest is 👍 cbor-x
```


### Benchmarks of `Writer` buffer size

When encoding bytes `CborEncoder` uses `Writer` class to write bytes to the underlying buffer.
The `Writer` preallocates a buffer of a certain size and then writes bytes to it.

Below benchmarks test various default buffer size allocation sizes of the underlying
`Writer` class. The default buffer size is 64 KB, but it can be changed to any value.

```
npx ts-node benchmarks/json-pack/bench.writer-size.ts
=========================================================== Benchmark: Encoding
Warmup: 1000x , Node.js: v18.16.0 , Arch: arm64 , CPU: Apple M1 Max
-------------------------------------------------------- Small object, 44 bytes
👍 1 MB x 6,313,890 ops/sec ±0.12% (101 runs sampled)
👍 256 KB x 6,289,685 ops/sec ±0.11% (97 runs sampled)
👍 64 KB x 6,275,863 ops/sec ±0.12% (100 runs sampled)
👍 16 KB x 6,254,832 ops/sec ±0.24% (98 runs sampled)
👍 4 KB x 6,187,636 ops/sec ±0.13% (99 runs sampled)
👍 1 KB x 5,890,157 ops/sec ±0.14% (99 runs sampled)
Fastest is 👍 1 MB
----------------------------------------------------- Typical object, 993 bytes
👍 1 MB x 497,752 ops/sec ±0.21% (100 runs sampled)
👍 256 KB x 495,574 ops/sec ±0.15% (99 runs sampled)
👍 64 KB x 494,724 ops/sec ±0.15% (98 runs sampled)
👍 16 KB x 489,579 ops/sec ±0.23% (97 runs sampled)
👍 4 KB x 455,526 ops/sec ±0.34% (98 runs sampled)
👍 1 KB x 433,038 ops/sec ±0.48% (97 runs sampled)
Fastest is 👍 1 MB
------------------------------------------------------ Large object, 3741 bytes
👍 1 MB x 140,580 ops/sec ±0.39% (96 runs sampled)
👍 256 KB x 136,933 ops/sec ±0.39% (92 runs sampled)
👍 64 KB x 139,697 ops/sec ±0.27% (98 runs sampled)
👍 16 KB x 137,278 ops/sec ±0.33% (98 runs sampled)
👍 4 KB x 130,838 ops/sec ±0.19% (98 runs sampled)
👍 1 KB x 122,987 ops/sec ±0.45% (94 runs sampled)
Fastest is 👍 1 MB
------------------------------------------------ Very large object, 45750 bytes
👍 1 MB x 5,883 ops/sec ±0.12% (101 runs sampled)
👍 256 KB x 5,845 ops/sec ±0.66% (91 runs sampled)
👍 64 KB x 5,783 ops/sec ±0.26% (100 runs sampled)
👍 16 KB x 5,584 ops/sec ±0.59% (94 runs sampled)
👍 4 KB x 5,648 ops/sec ±0.35% (98 runs sampled)
👍 1 KB x 5,649 ops/sec ±0.35% (95 runs sampled)
Fastest is 👍 1 MB,👍 256 KB
---------------------------------------------- Object with many keys, 969 bytes
👍 1 MB x 282,535 ops/sec ±0.34% (98 runs sampled)
👍 256 KB x 282,055 ops/sec ±0.34% (95 runs sampled)
👍 64 KB x 286,786 ops/sec ±0.22% (97 runs sampled)
👍 16 KB x 283,067 ops/sec ±0.27% (97 runs sampled)
👍 4 KB x 281,647 ops/sec ±0.24% (100 runs sampled)
👍 1 KB x 259,775 ops/sec ±0.33% (96 runs sampled)
Fastest is 👍 64 KB
----------------------------------------------------- String ladder, 3398 bytes
👍 1 MB x 308,326 ops/sec ±0.23% (96 runs sampled)
👍 256 KB x 307,324 ops/sec ±0.34% (100 runs sampled)
👍 64 KB x 305,368 ops/sec ±0.23% (97 runs sampled)
👍 16 KB x 289,570 ops/sec ±0.46% (99 runs sampled)
👍 4 KB x 270,486 ops/sec ±0.52% (96 runs sampled)
👍 1 KB x 211,091 ops/sec ±0.57% (95 runs sampled)
Fastest is 👍 1 MB,👍 256 KB
------------------------------------------------------ Long strings, 7011 bytes
👍 1 MB x 446,622 ops/sec ±0.48% (98 runs sampled)
👍 256 KB x 438,083 ops/sec ±0.58% (94 runs sampled)
👍 64 KB x 421,277 ops/sec ±0.50% (97 runs sampled)
👍 16 KB x 349,768 ops/sec ±1.32% (93 runs sampled)
👍 4 KB x 350,886 ops/sec ±0.76% (92 runs sampled)
👍 1 KB x 348,879 ops/sec ±1.00% (92 runs sampled)
Fastest is 👍 1 MB
------------------------------------------------------ Short strings, 170 bytes
👍 1 MB x 2,003,291 ops/sec ±0.18% (99 runs sampled)
👍 256 KB x 2,002,815 ops/sec ±0.30% (98 runs sampled)
👍 64 KB x 2,003,416 ops/sec ±0.22% (98 runs sampled)
👍 16 KB x 1,973,326 ops/sec ±0.31% (96 runs sampled)
👍 4 KB x 1,938,991 ops/sec ±0.28% (98 runs sampled)
👍 1 KB x 1,815,441 ops/sec ±0.24% (99 runs sampled)
Fastest is 👍 1 MB,👍 64 KB,👍 256 KB
------------------------------------------------------------ Numbers, 136 bytes
👍 1 MB x 3,301,798 ops/sec ±0.25% (99 runs sampled)
👍 256 KB x 3,284,645 ops/sec ±0.30% (98 runs sampled)
👍 64 KB x 3,272,060 ops/sec ±0.94% (96 runs sampled)
👍 16 KB x 3,317,569 ops/sec ±0.25% (98 runs sampled)
👍 4 KB x 3,238,186 ops/sec ±0.34% (96 runs sampled)
👍 1 KB x 3,017,336 ops/sec ±0.68% (98 runs sampled)
Fastest is 👍 16 KB
------------------------------------------------------------- Tokens, 308 bytes
👍 1 MB x 1,698,059 ops/sec ±0.24% (101 runs sampled)
👍 256 KB x 1,644,210 ops/sec ±0.70% (99 runs sampled)
👍 64 KB x 1,680,855 ops/sec ±0.22% (97 runs sampled)
👍 16 KB x 1,651,801 ops/sec ±0.35% (97 runs sampled)
👍 4 KB x 1,634,786 ops/sec ±0.72% (95 runs sampled)
👍 1 KB x 1,633,724 ops/sec ±0.25% (98 runs sampled)
Fastest is 👍 1 MB
```


### Result Slices

The method `.encode()` returns a `Uint8Array` but you can also get a
`Slice` which is a view into the underlying buffer. Create a `Slice` is much
faster than creating a `Uint8Array`.

This overhead becomes significant when encoding small objects. To receive a
`Slice` as a result, use the `.encodeToSlice()` method.

```
npx ts-node benchmarks/json-pack/bench.slice.ts
=========================================================== Benchmark: Encoding
Warmup: 1000x , Node.js: v18.16.0 , Arch: arm64 , CPU: Apple M1 Max
-------------------------------------------------------- Small object, 44 bytes
👍 Uint8Array x 6,375,191 ops/sec ±0.29% (99 runs sampled)
👎 Slice x 7,477,318 ops/sec ±0.24% (99 runs sampled)
Fastest is 👎 Slice
----------------------------------------------------- Typical object, 993 bytes
👍 Uint8Array x 481,245 ops/sec ±0.27% (95 runs sampled)
👎 Slice x 487,881 ops/sec ±0.24% (95 runs sampled)
Fastest is 👎 Slice
------------------------------------------------------ Large object, 3741 bytes
👍 Uint8Array x 139,034 ops/sec ±0.28% (99 runs sampled)
👎 Slice x 139,084 ops/sec ±0.30% (93 runs sampled)
Fastest is 👎 Slice,👍 Uint8Array
------------------------------------------------ Very large object, 45750 bytes
👍 Uint8Array x 5,992 ops/sec ±0.17% (98 runs sampled)
👎 Slice x 5,973 ops/sec ±0.18% (101 runs sampled)
Fastest is 👍 Uint8Array
---------------------------------------------- Object with many keys, 969 bytes
👍 Uint8Array x 283,511 ops/sec ±0.21% (96 runs sampled)
👎 Slice x 284,962 ops/sec ±0.20% (100 runs sampled)
Fastest is 👎 Slice
----------------------------------------------------- String ladder, 3398 bytes
👍 Uint8Array x 321,418 ops/sec ±0.36% (97 runs sampled)
👎 Slice x 324,213 ops/sec ±0.34% (99 runs sampled)
Fastest is 👎 Slice
------------------------------------------------------ Long strings, 7011 bytes
👍 Uint8Array x 417,711 ops/sec ±0.72% (94 runs sampled)
👎 Slice x 421,504 ops/sec ±0.72% (94 runs sampled)
Fastest is 👎 Slice
------------------------------------------------------ Short strings, 170 bytes
👍 Uint8Array x 2,186,736 ops/sec ±0.21% (97 runs sampled)
👎 Slice x 2,283,908 ops/sec ±0.26% (98 runs sampled)
Fastest is 👎 Slice
------------------------------------------------------------ Numbers, 136 bytes
👍 Uint8Array x 3,305,268 ops/sec ±0.21% (100 runs sampled)
👎 Slice x 3,526,413 ops/sec ±0.32% (97 runs sampled)
Fastest is 👎 Slice
------------------------------------------------------------- Tokens, 308 bytes
👍 Uint8Array x 1,681,882 ops/sec ±0.14% (100 runs sampled)
👎 Slice x 1,721,419 ops/sec ±0.35% (97 runs sampled)
Fastest is 👎 Slice
```
