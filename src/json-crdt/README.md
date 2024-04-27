# JSON CRDT

CRDT implementation of a JSON type.

- Snapshot encoding
  - [Binary encoding](./codec/binary/README.md)

## Benchmarks

Inserting ten 10-character strings and deleting one 10-character string range
and random positions of a 10,000-character newly created string.

```
node benchmarks/json-crdt/strings-short.js
json-crdt StrNode type x 228,880 ops/sec ±0.07% (99 runs sampled)
json-crdt x 187,700 ops/sec ±0.17% (98 runs sampled)
Y.js x 18,288 ops/sec ±0.19% (100 runs sampled)
Automerge x 23.64 ops/sec ±1.54% (44 runs sampled)
Fastest is json-crdt StrNode type
```

Inserting one 10-char string and deleting one 10-char string range at random
positions from a 10,000-char string, which was beforehand already edited 5,000 times.

```
node benchmarks/json-crdt/strings-long.js
json-crdt StrNode type x 54,250 ops/sec ±20.68% (23 runs sampled)
json-crdt x 59,628 ops/sec ±14.39% (32 runs sampled)
Y.js x 16,358 ops/sec ±10.79% (45 runs sampled)
Automerge x 1,777 ops/sec ±5.97% (76 runs sampled)
Fastest is json-crdt,json-crdt StrNode type
```

Editing a string at 10 repeating positions with +/- 6 characters random variance
from those positions.

```
node benchmarks/json-crdt/strings-repeat-insert-positions.js
json-crdt StrNode type x 8,313 ops/sec ±1.52% (93 runs sampled)
json-crdt x 6,292 ops/sec ±2.22% (77 runs sampled)
Y.js x 3,104 ops/sec ±1.40% (78 runs sampled)
Automerge x 246 ops/sec ±1.04% (85 runs sampled)
Fastest is json-crdt StrNode type
```

### Real-world comparisons

Ingesting Martin Kleppman's test document. Libraries a run few times to allow
the compiler to optimize.

```
node benchmarks/json-crdt/automerge-paper.js
Document operations: 259778 [
  [ 0, 0, '\\' ],  [ 1, 0, 'd' ],   [ 2, 0, 'o' ],   [ 3, 0, 'c' ],
  [ 4, 0, 'u' ],   [ 5, 0, 'm' ],   [ 6, 0, 'e' ],   [ 7, 0, 'n' ],
  [ 8, 0, 't' ],   [ 9, 0, 'c' ],   [ 10, 0, 'l' ],  [ 11, 0, 'a' ],
  [ 12, 0, 's' ],  [ 13, 0, 's' ],  [ 14, 0, '[' ],  [ 15, 0, 'a' ],
  [ 16, 0, '4' ],  [ 17, 0, 'p' ],  [ 18, 0, 'a' ],  [ 19, 0, 'p' ],
  [ 20, 0, 'e' ],  [ 21, 0, 'r' ],  [ 22, 0, ',' ],  [ 23, 0, 't' ],
  [ 24, 0, 'w' ],  [ 25, 0, 'o' ],  [ 26, 0, 'c' ],  [ 27, 0, 'o' ],
  [ 28, 0, 'l' ],  [ 29, 0, 'u' ],  [ 30, 0, 'm' ],  [ 31, 0, 'n' ],
  [ 32, 0, ',' ],  [ 33, 0, '1' ],  [ 34, 0, '0' ],  [ 35, 0, 'p' ],
  [ 36, 0, 't' ],  [ 37, 0, ']' ],  [ 38, 0, '{' ],  [ 39, 0, 'a' ],
  [ 40, 0, 'r' ],  [ 41, 0, 't' ],  [ 42, 0, 'i' ],  [ 43, 0, 'c' ],
  [ 44, 0, 'l' ],  [ 45, 0, 'e' ],  [ 46, 0, '}' ],  [ 47, 0, '\n' ],
  [ 48, 0, '\\' ], [ 49, 0, 'u' ],  [ 50, 0, 's' ],  [ 51, 0, 'e' ],
  [ 52, 0, 'p' ],  [ 53, 0, 'a' ],  [ 54, 0, 'c' ],  [ 55, 0, 'k' ],
  [ 56, 0, 'a' ],  [ 57, 0, 'g' ],  [ 58, 0, 'e' ],  [ 59, 0, '{' ],
  [ 59, 1, '' ],   [ 59, 0, '[' ],  [ 60, 0, 'u' ],  [ 61, 0, 't' ],
  [ 62, 0, 'f' ],  [ 63, 0, '8' ],  [ 64, 0, ']' ],  [ 65, 0, '{' ],
  [ 66, 0, 'i' ],  [ 67, 0, 'n' ],  [ 68, 0, 'p' ],  [ 69, 0, 'u' ],
  [ 70, 0, 't' ],  [ 71, 0, 'e' ],  [ 72, 0, 'n' ],  [ 73, 0, 'c' ],
  [ 74, 0, '}' ],  [ 75, 0, '\n' ], [ 76, 0, '\\' ], [ 77, 0, 'u' ],
  [ 78, 0, 's' ],  [ 79, 0, 'e' ],  [ 80, 0, 'p' ],  [ 81, 0, 'a' ],
  [ 82, 0, 'c' ],  [ 83, 0, 'k' ],  [ 84, 0, 'a' ],  [ 85, 0, 'g' ],
  [ 86, 0, 'e' ],  [ 87, 0, '{' ],  [ 88, 0, 'm' ],  [ 89, 0, 'a' ],
  [ 90, 0, 't' ],  [ 91, 0, 'h' ],  [ 92, 0, 'p' ],  [ 93, 0, 't' ],
  [ 94, 0, 'm' ],  [ 95, 0, 'x' ],  [ 96, 0, '}' ],  [ 97, 0, ' ' ],
  ... 259678 more items
]
---------------------------------------------
V8 strings: 686.348ms
String length: 104852 , Operations: 259778
---------------------------------------------
Automerge: 2:03.677 (m:ss.mmm)
String length: 104852
---------------------------------------------
Automerge: 2:04.813 (m:ss.mmm)
String length: 104852
---------------------------------------------
Y.js: 970.197ms
String length: 104852 , Chunk count: 10971
---------------------------------------------
Y.js: 977.349ms
String length: 104852 , Chunk count: 10971
---------------------------------------------
Y.js: 929.959ms
String length: 104852 , Chunk count: 10971
---------------------------------------------
Y.js: 921.977ms
String length: 104852 , Chunk count: 10971
---------------------------------------------
JSON CRDT: 323.02ms
String length: 104852 , Chunk count: 12487
---------------------------------------------
JSON CRDT: 149.762ms
String length: 104852 , Chunk count: 12487
---------------------------------------------
JSON CRDT: 163.2ms
String length: 104852 , Chunk count: 12487
---------------------------------------------
JSON CRDT: 134.596ms
String length: 104852 , Chunk count: 12487
---------------------------------------------
JSON CRDT StrNode: 85.254ms
String length: 104852 , Chunk count: 12387
---------------------------------------------
JSON CRDT StrNode: 86.487ms
String length: 104852 , Chunk count: 12387
---------------------------------------------
JSON CRDT StrNode: 73.346ms
String length: 104852 , Chunk count: 12387
---------------------------------------------
JSON CRDT StrNode: 74.109ms
String length: 104852 , Chunk count: 12387
---------------------------------------------
JSON CRDT StrNode: 73.593ms
String length: 104852 , Chunk count: 12387
---------------------------------------------
JSON CRDT StrNode: 74.138ms
String length: 104852 , Chunk count: 12387
---------------------------------------------
diamond-types-node: 58.114ms
String length: 104852
---------------------------------------------
diamond-types-node: 52.41ms
String length: 104852
---------------------------------------------
diamond-types-node: 48.754ms
String length: 104852
---------------------------------------------
diamond-types-node: 48.582ms
String length: 104852
---------------------------------------------
diamond-types-node: 48.818ms
String length: 104852
---------------------------------------------
diamond-types-node: 48.528ms
String length: 104852
```

### Serialization

Small object:

```
node benchmarks/json-crdt/serialization.js
Sizes:
JSON.stringify(): 44 bytes (✅)
MessagePack: 33 bytes (✅)
JSON CRDT (server clock) + binary codec with view decoder: 51 bytes (✅)
JSON CRDT (server clock) + binary codec: 51 bytes (✅)
JSON CRDT (server clock) + compact-binary codec: 59 bytes (✅)
JSON CRDT (server clock) + compact codec: 103 bytes (✅)
JSON CRDT (server clock) + json codec: 371 bytes (✅)
Y.js: 83 bytes (✅)
Automerge: 190 bytes (✅)
JSON CRDT (server clock) + binary codec + zlib.deflateSync: 54 bytes (✅)
JSON CRDT (server clock) + binary codec + lz4: 72 bytes (✅)
JSON CRDT (server clock) + binary codec + pako: 60 bytes (✅)

Encode:
JSON.stringify() x 2,742,373 ops/sec ±0.13% (96 runs sampled)
MessagePack x 1,791,058 ops/sec ±0.63% (95 runs sampled)
JSON CRDT (server clock) + binary codec with view decoder x 373,868 ops/sec ±0.07% (100 runs sampled)
JSON CRDT (server clock) + binary codec x 372,352 ops/sec ±0.19% (99 runs sampled)
JSON CRDT (server clock) + compact-binary codec x 420,532 ops/sec ±0.17% (98 runs sampled)
JSON CRDT (server clock) + compact codec x 405,953 ops/sec ±0.08% (99 runs sampled)
JSON CRDT (server clock) + json codec x 289,422 ops/sec ±0.07% (98 runs sampled)
Y.js x 24,195 ops/sec ±0.53% (99 runs sampled)
Automerge x 8,829 ops/sec ±1.02% (95 runs sampled)
JSON CRDT (server clock) + binary codec + zlib.deflateSync x 73,415 ops/sec ±6.61% (60 runs sampled)
JSON CRDT (server clock) + binary codec + lz4 x 96,320 ops/sec ±7.18% (79 runs sampled)
JSON CRDT (server clock) + binary codec + pako x 13,529 ops/sec ±32.96% (96 runs sampled)
Fastest is JSON.stringify()

Decode:
JSON.stringify() x 2,620,070 ops/sec ±0.28% (97 runs sampled)
MessagePack x 3,607,467 ops/sec ±0.24% (99 runs sampled)
JSON CRDT (server clock) + binary codec with view decoder x 1,244,894 ops/sec ±0.57% (95 runs sampled)
JSON CRDT (server clock) + binary codec x 100,157 ops/sec ±13.60% (74 runs sampled)
JSON CRDT (server clock) + compact-binary codec x 95,708 ops/sec ±18.65% (65 runs sampled)
JSON CRDT (server clock) + compact codec x 114,820 ops/sec ±12.43% (76 runs sampled)
JSON CRDT (server clock) + json codec x 88,809 ops/sec ±10.84% (77 runs sampled)
Y.js x 13,438 ops/sec ±2.14% (86 runs sampled)
Automerge x 22,939 ops/sec ±1.00% (91 runs sampled)
JSON CRDT (server clock) + binary codec + zlib.deflateSync x 54,099 ops/sec ±15.32% (76 runs sampled)
JSON CRDT (server clock) + binary codec + lz4 x 219 ops/sec ±3.65% (11 runs sampled)
JSON CRDT (server clock) + binary codec + pako x 52,800 ops/sec ±11.82% (83 runs sampled)
Fastest is MessagePack
```

Medium object:

```
node benchmarks/json-crdt/serialization.js
Sizes:
JSON.stringify(): 590 bytes (✅)
MessagePack: 447 bytes (✅)
JSON CRDT (server clock) + binary codec with view decoder: 605 bytes (✅)
JSON CRDT (server clock) + binary codec: 605 bytes (✅)
JSON CRDT (server clock) + compact-binary codec: 744 bytes (✅)
JSON CRDT (server clock) + compact codec: 1204 bytes (✅)
JSON CRDT (server clock) + json codec: 3494 bytes (✅)
Y.js: 861 bytes (✅)
Automerge: 739 bytes (✅)
JSON CRDT (server clock) + binary codec + zlib.deflateSync: 543 bytes (✅)
JSON CRDT (server clock) + binary codec + lz4: 601 bytes (✅)
JSON CRDT (server clock) + binary codec + pako: 549 bytes (✅)

Encode:
JSON.stringify() x 308,041 ops/sec ±0.13% (98 runs sampled)
MessagePack x 319,669 ops/sec ±0.10% (98 runs sampled)
JSON CRDT (server clock) + binary codec with view decoder x 39,727 ops/sec ±0.06% (100 runs sampled)
JSON CRDT (server clock) + binary codec x 39,600 ops/sec ±0.07% (101 runs sampled)
JSON CRDT (server clock) + compact-binary codec x 43,816 ops/sec ±0.09% (100 runs sampled)
JSON CRDT (server clock) + compact codec x 42,724 ops/sec ±0.26% (102 runs sampled)
JSON CRDT (server clock) + json codec x 29,257 ops/sec ±0.09% (100 runs sampled)
Y.js x 16,470 ops/sec ±0.42% (96 runs sampled)
Automerge x 696 ops/sec ±2.26% (93 runs sampled)
JSON CRDT (server clock) + binary codec + zlib.deflateSync x 24,666 ops/sec ±1.05% (97 runs sampled)
JSON CRDT (server clock) + binary codec + lz4 x 28,408 ops/sec ±3.82% (93 runs sampled)
JSON CRDT (server clock) + binary codec + pako x 10,424 ops/sec ±3.49% (98 runs sampled)
Fastest is MessagePack

Decode:
JSON.stringify() x 344,446 ops/sec ±0.17% (98 runs sampled)
MessagePack x 313,293 ops/sec ±0.16% (100 runs sampled)
JSON CRDT (server clock) + binary codec with view decoder x 154,567 ops/sec ±0.15% (100 runs sampled)
JSON CRDT (server clock) + binary codec x 12,118 ops/sec ±9.24% (78 runs sampled)
JSON CRDT (server clock) + compact-binary codec x 12,521 ops/sec ±10.45% (81 runs sampled)
JSON CRDT (server clock) + compact codec x 13,053 ops/sec ±10.41% (77 runs sampled)
JSON CRDT (server clock) + json codec x 10,773 ops/sec ±6.84% (89 runs sampled)
Y.js x 11,955 ops/sec ±0.37% (99 runs sampled)
Automerge x 4,767 ops/sec ±1.08% (91 runs sampled)
JSON CRDT (server clock) + binary codec + zlib.deflateSync x 10,895 ops/sec ±10.22% (79 runs sampled)
JSON CRDT (server clock) + binary codec + lz4 x 614 ops/sec ±1.71% (34 runs sampled)
JSON CRDT (server clock) + binary codec + pako x 9,784 ops/sec ±16.25% (83 runs sampled)
Fastest is JSON.stringify()
```

Large object:

```
node benchmarks/json-crdt/serialization.js
Sizes:
JSON.stringify(): 3747 bytes (✅)
MessagePack: 3320 bytes (✅)
JSON CRDT (server clock) + binary codec with view decoder: 3700 bytes (✅)
JSON CRDT (server clock) + binary codec: 3700 bytes (✅)
JSON CRDT (server clock) + compact-binary codec: 4671 bytes (✅)
JSON CRDT (server clock) + compact codec: 6021 bytes (✅)
JSON CRDT (server clock) + json codec: 13123 bytes (✅)
Y.js: 4625 bytes (✅)
Automerge: 2483 bytes (✅)
JSON CRDT (server clock) + binary codec + zlib.deflateSync: 2682 bytes (✅)
JSON CRDT (server clock) + binary codec + lz4: 3230 bytes (✅)
JSON CRDT (server clock) + binary codec + pako: 2688 bytes (✅)

Encode:
JSON.stringify() x 75,174 ops/sec ±0.09% (99 runs sampled)
MessagePack x 72,444 ops/sec ±0.07% (101 runs sampled)
JSON CRDT (server clock) + binary codec with view decoder x 10,781 ops/sec ±0.24% (97 runs sampled)
JSON CRDT (server clock) + binary codec x 10,775 ops/sec ±0.29% (99 runs sampled)
JSON CRDT (server clock) + compact-binary codec x 12,390 ops/sec ±0.08% (99 runs sampled)
JSON CRDT (server clock) + compact codec x 12,494 ops/sec ±0.10% (99 runs sampled)
JSON CRDT (server clock) + json codec x 8,649 ops/sec ±0.17% (101 runs sampled)
Y.js x 7,655 ops/sec ±0.36% (96 runs sampled)
Automerge x 102 ops/sec ±1.51% (77 runs sampled)
JSON CRDT (server clock) + binary codec + zlib.deflateSync x 6,794 ops/sec ±0.66% (95 runs sampled)
JSON CRDT (server clock) + binary codec + lz4 x 9,118 ops/sec ±1.82% (99 runs sampled)
JSON CRDT (server clock) + binary codec + pako x 4,265 ops/sec ±0.31% (97 runs sampled)
Fastest is JSON.stringify()

Decode:
JSON.stringify() x 91,995 ops/sec ±0.09% (97 runs sampled)
MessagePack x 44,282 ops/sec ±0.10% (101 runs sampled)
JSON CRDT (server clock) + binary codec with view decoder x 32,168 ops/sec ±0.12% (97 runs sampled)
JSON CRDT (server clock) + binary codec x 3,896 ops/sec ±5.81% (84 runs sampled)
JSON CRDT (server clock) + compact-binary codec x 3,653 ops/sec ±4.87% (86 runs sampled)
JSON CRDT (server clock) + compact codec x 4,863 ops/sec ±4.81% (83 runs sampled)
JSON CRDT (server clock) + json codec x 3,627 ops/sec ±5.56% (92 runs sampled)
Y.js x 6,010 ops/sec ±0.39% (96 runs sampled)
Automerge x 1,418 ops/sec ±0.51% (98 runs sampled)
JSON CRDT (server clock) + binary codec + zlib.deflateSync x 3,633 ops/sec ±5.64% (89 runs sampled)
JSON CRDT (server clock) + binary codec + lz4 x 629 ops/sec ±1.15% (34 runs sampled)
JSON CRDT (server clock) + binary codec + pako x 3,218 ops/sec ±5.85% (82 runs sampled)
Fastest is JSON.stringify()
```
