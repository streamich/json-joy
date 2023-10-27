# AVL Tree

This library implements a balanced binary search tree (AVL tree) with the following properties:

-  O(log n) insert, delete, find, min, max
-  O(2n) iteration
-  O(1) predecessor, successor
-  O(lon n) min, max
-  Each node stores a key and a value
-  Each node stores a balance factor `bf` in the range of [-1, 1]
-  Each node stores pointers to parent, left and right child


## Benchmarks

### Inserts

vs other sorted key libraries:

```
npx ts-node benchmarks/util/trees/bench.map.insert.nums.libs.ts
============================================================== Benchmark: Numeric inserts into maps
Warmup: 1000x , Node.js: v20.1.0 , Arch: arm64 , CPU: Apple M1
--------------------------------------------------------------------- Natural numbers from 10 to 19
🤞 json-joy AvlBstNumNumMap x 6,813,115 ops/sec ±0.21% (102 runs sampled)
🤞 json-joy AvlMap<number, number> x 6,551,550 ops/sec ±0.26% (100 runs sampled)
🤞 json-joy Tree<number, number> x 11,464,558 ops/sec ±1.00% (100 runs sampled)
🤞 json-joy RadixTree x 2,818,437 ops/sec ±0.15% (98 runs sampled)
🤞 sorted-btree BTree x 1,808,419 ops/sec ±0.15% (99 runs sampled)
🤞 js-sdsl OrderedMap x 4,747,049 ops/sec ±0.27% (97 runs sampled)
Fastest is 🤞 json-joy Tree<number, number>
------------------------------------------------------------------- Natural numbers from 100 to 199
🤞 json-joy AvlBstNumNumMap x 389,003 ops/sec ±0.98% (99 runs sampled)
🤞 json-joy AvlMap<number, number> x 363,491 ops/sec ±0.06% (102 runs sampled)
🤞 json-joy Tree<number, number> x 1,118,010 ops/sec ±0.48% (97 runs sampled)
🤞 json-joy RadixTree x 142,158 ops/sec ±0.55% (100 runs sampled)
🤞 sorted-btree BTree x 116,945 ops/sec ±0.14% (101 runs sampled)
🤞 js-sdsl OrderedMap x 397,672 ops/sec ±0.06% (102 runs sampled)
Fastest is 🤞 json-joy Tree<number, number>
----------------------------------------------------------------- Natural numbers from 1000 to 1999
🤞 json-joy AvlBstNumNumMap x 30,573 ops/sec ±0.28% (101 runs sampled)
🤞 json-joy AvlMap<number, number> x 28,887 ops/sec ±0.08% (99 runs sampled)
🤞 json-joy Tree<number, number> x 114,020 ops/sec ±0.12% (99 runs sampled)
🤞 json-joy RadixTree x 9,992 ops/sec ±0.14% (98 runs sampled)
🤞 sorted-btree BTree x 10,195 ops/sec ±0.08% (102 runs sampled)
🤞 js-sdsl OrderedMap x 38,432 ops/sec ±0.27% (101 runs sampled)
Fastest is 🤞 json-joy Tree<number, number>
--------------------------------------------------------------- Natural numbers from 10000 to 19999
🤞 json-joy AvlBstNumNumMap x 2,498 ops/sec ±0.40% (96 runs sampled)
🤞 json-joy AvlMap<number, number> x 2,347 ops/sec ±0.54% (99 runs sampled)
🤞 json-joy Tree<number, number> x 7,512 ops/sec ±10.55% (65 runs sampled)
🤞 json-joy RadixTree x 793 ops/sec ±0.50% (97 runs sampled)
🤞 sorted-btree BTree x 744 ops/sec ±0.32% (98 runs sampled)
🤞 js-sdsl OrderedMap x 3,632 ops/sec ±1.52% (98 runs sampled)
Fastest is 🤞 json-joy Tree<number, number>
------------------------------------------------------------- Natural numbers from 100000 to 199999
🤞 json-joy AvlBstNumNumMap x 214 ops/sec ±0.07% (92 runs sampled)
🤞 json-joy AvlMap<number, number> x 202 ops/sec ±0.11% (87 runs sampled)
🤞 json-joy Tree<number, number> x 632 ops/sec ±0.53% (54 runs sampled)
🤞 json-joy RadixTree x 54.70 ops/sec ±1.23% (72 runs sampled)
🤞 sorted-btree BTree x 63.91 ops/sec ±0.16% (68 runs sampled)
🤞 js-sdsl OrderedMap x 341 ops/sec ±0.15% (88 runs sampled)
Fastest is 🤞 json-joy Tree<number, number>
-------------------------------------------------------------------- Natural numbers from 1000 to 1
🤞 json-joy AvlBstNumNumMap x 25,579 ops/sec ±0.15% (99 runs sampled)
🤞 json-joy AvlMap<number, number> x 22,270 ops/sec ±0.17% (101 runs sampled)
🤞 json-joy Tree<number, number> x 97,444 ops/sec ±0.42% (98 runs sampled)
🤞 json-joy RadixTree x 10,743 ops/sec ±0.27% (100 runs sampled)
🤞 sorted-btree BTree x 10,162 ops/sec ±0.88% (99 runs sampled)
🤞 js-sdsl OrderedMap x 40,310 ops/sec ±0.14% (100 runs sampled)
Fastest is 🤞 json-joy Tree<number, number>
-------------------------------------------------------------------------------- Random 100 numbers
🤞 json-joy AvlBstNumNumMap x 550,423 ops/sec ±0.16% (101 runs sampled)
🤞 json-joy AvlMap<number, number> x 514,462 ops/sec ±0.14% (100 runs sampled)
🤞 json-joy Tree<number, number> x 139,674 ops/sec ±0.77% (101 runs sampled)
🤞 json-joy RadixTree x 289,622 ops/sec ±0.14% (98 runs sampled)
🤞 sorted-btree BTree x 176,945 ops/sec ±0.21% (100 runs sampled)
🤞 js-sdsl OrderedMap x 401,242 ops/sec ±0.75% (101 runs sampled)
Fastest is 🤞 json-joy AvlBstNumNumMap
------------------------------------------------------------------------------- Random 1000 numbers
🤞 json-joy AvlBstNumNumMap x 29,175 ops/sec ±1.32% (85 runs sampled)
🤞 json-joy AvlMap<number, number> x 25,674 ops/sec ±1.00% (92 runs sampled)
🤞 json-joy Tree<number, number> x 5,457 ops/sec ±0.38% (97 runs sampled)
🤞 json-joy RadixTree x 13,186 ops/sec ±0.63% (98 runs sampled)
🤞 sorted-btree BTree x 9,889 ops/sec ±0.17% (97 runs sampled)
🤞 js-sdsl OrderedMap x 19,875 ops/sec ±0.36% (95 runs sampled)
Fastest is 🤞 json-joy AvlBstNumNumMap
```


vs native map-like structures:

```
npx ts-node benchmarks/util/trees/bench.map.insert.nums.native.ts
============================================================== Benchmark: Numeric inserts into maps
Warmup: 1000x , Node.js: v20.1.0 , Arch: arm64 , CPU: Apple M1
------------------------------------------------------------------ 10 natural numbers from 10 to 55
🤞 Array<number> x 16,987,726 ops/sec ±0.42% (100 runs sampled)
🤞 Record<number, number> x 4,991,641 ops/sec ±0.13% (100 runs sampled)
🤞 Map<number, number> x 4,968,047 ops/sec ±0.64% (102 runs sampled)
🤞 json-joy AvlBstNumNumMap x 6,635,950 ops/sec ±0.17% (100 runs sampled)
🤞 json-joy Tree<number, number> x 11,617,062 ops/sec ±0.11% (97 runs sampled)
🤞 json-joy RadixTree x 3,663,716 ops/sec ±0.07% (101 runs sampled)
Fastest is 🤞 Array<number>
--------------------------------------------------------------- 100 natural numbers from 100 to 595
🤞 Array<number> x 954,753 ops/sec ±0.70% (98 runs sampled)
🤞 Record<number, number> x 695,568 ops/sec ±0.10% (98 runs sampled)
🤞 Map<number, number> x 544,995 ops/sec ±3.36% (96 runs sampled)
🤞 json-joy AvlBstNumNumMap x 391,895 ops/sec ±0.75% (96 runs sampled)
🤞 json-joy Tree<number, number> x 1,131,394 ops/sec ±0.66% (98 runs sampled)
🤞 json-joy RadixTree x 159,617 ops/sec ±0.06% (100 runs sampled)
Fastest is 🤞 json-joy Tree<number, number>
------------------------------------------------------------ 1000 natural numbers from 1000 to 5995
🤞 Array<number> x 81,293 ops/sec ±0.11% (99 runs sampled)
🤞 Record<number, number> x 57,162 ops/sec ±0.43% (96 runs sampled)
🤞 Map<number, number> x 55,854 ops/sec ±0.56% (96 runs sampled)
🤞 json-joy AvlBstNumNumMap x 31,584 ops/sec ±0.11% (101 runs sampled)
🤞 json-joy Tree<number, number> x 114,225 ops/sec ±0.09% (98 runs sampled)
🤞 json-joy RadixTree x 10,145 ops/sec ±0.09% (100 runs sampled)
Fastest is 🤞 json-joy Tree<number, number>
--------------------------------------------------------- 10000 natural numbers from 10000 to 59995
🤞 Array<number> x 1,110 ops/sec ±0.22% (97 runs sampled)
🤞 Record<number, number> x 1,131 ops/sec ±1.28% (97 runs sampled)
🤞 Map<number, number> x 2,270 ops/sec ±1.08% (96 runs sampled)
🤞 json-joy AvlBstNumNumMap x 2,534 ops/sec ±0.34% (99 runs sampled)
🤞 json-joy Tree<number, number> x 10,274 ops/sec ±0.66% (89 runs sampled)
🤞 json-joy RadixTree x 844 ops/sec ±0.31% (99 runs sampled)
Fastest is 🤞 json-joy Tree<number, number>
------------------------------------------------------ 100000 natural numbers from 100000 to 599995
🤞 Array<number> x 117 ops/sec ±1.06% (87 runs sampled)
🤞 Record<number, number> x 121 ops/sec ±1.14% (79 runs sampled)
🤞 Map<number, number> x 222 ops/sec ±1.00% (89 runs sampled)
🤞 json-joy AvlBstNumNumMap x 218 ops/sec ±0.10% (87 runs sampled)
🤞 json-joy Tree<number, number> x 569 ops/sec ±6.83% (46 runs sampled)
🤞 json-joy RadixTree x 49.95 ops/sec ±2.45% (66 runs sampled)
Fastest is 🤞 json-joy Tree<number, number>
--------------------------------------------------------------- 1000 natural numbers from 1000 to 1
🤞 Array<number> x 120,681 ops/sec ±0.11% (102 runs sampled)
🤞 Record<number, number> x 140,447 ops/sec ±0.25% (102 runs sampled)
🤞 Map<number, number> x 55,575 ops/sec ±0.26% (95 runs sampled)
🤞 json-joy AvlBstNumNumMap x 27,038 ops/sec ±0.14% (98 runs sampled)
🤞 json-joy Tree<number, number> x 111,215 ops/sec ±0.10% (100 runs sampled)
🤞 json-joy RadixTree x 11,009 ops/sec ±0.12% (99 runs sampled)
Fastest is 🤞 Record<number, number>
-------------------------------------------------------------------------------- Random 100 numbers
🤞 Array<number> x 1,064,707 ops/sec ±0.60% (99 runs sampled)
🤞 Record<number, number> x 1,259,995 ops/sec ±0.20% (99 runs sampled)
🤞 Map<number, number> x 800,948 ops/sec ±0.49% (98 runs sampled)
🤞 json-joy AvlBstNumNumMap x 545,669 ops/sec ±0.13% (98 runs sampled)
🤞 json-joy Tree<number, number> x 143,140 ops/sec ±0.08% (99 runs sampled)
🤞 json-joy RadixTree x 255,803 ops/sec ±0.11% (100 runs sampled)
Fastest is 🤞 Record<number, number>
------------------------------------------------------------------------------- Random 1000 numbers
🤞 Array<number> x 99,963 ops/sec ±0.08% (102 runs sampled)
🤞 Record<number, number> x 109,482 ops/sec ±0.07% (99 runs sampled)
🤞 Map<number, number> x 66,983 ops/sec ±0.42% (97 runs sampled)
🤞 json-joy AvlBstNumNumMap x 26,277 ops/sec ±0.82% (89 runs sampled)
🤞 json-joy Tree<number, number> x 5,418 ops/sec ±0.17% (100 runs sampled)
🤞 json-joy RadixTree x 13,476 ops/sec ±0.11% (97 runs sampled)
Fastest is 🤞 Record<number, number>


npx ts-node benchmarks/util/trees/bench.map.insert.nums.native.ts
============================================================== Benchmark: Numeric inserts into maps
Warmup: 1000x , Node.js: v18.16.0 , Arch: arm64 , CPU: Apple M1
------------------------------------------------------------------ 10 natural numbers from 10 to 55
🤞 Array<number> x 14,158,942 ops/sec ±0.19% (101 runs sampled)
🤞 Record<number, number> x 4,634,530 ops/sec ±0.12% (100 runs sampled)
🤞 Map<number, number> x 4,707,284 ops/sec ±0.46% (99 runs sampled)
🤞 json-joy AvlBstNumNumMap x 6,327,497 ops/sec ±0.99% (100 runs sampled)
🤞 json-joy Tree<number, number> x 10,392,686 ops/sec ±0.10% (101 runs sampled)
🤞 json-joy RadixTree x 3,158,652 ops/sec ±0.08% (101 runs sampled)
Fastest is 🤞 Array<number>
--------------------------------------------------------------- 100 natural numbers from 100 to 595
🤞 Array<number> x 871,272 ops/sec ±0.89% (98 runs sampled)
🤞 Record<number, number> x 660,795 ops/sec ±0.09% (100 runs sampled)
🤞 Map<number, number> x 553,137 ops/sec ±0.24% (99 runs sampled)
🤞 json-joy AvlBstNumNumMap x 377,195 ops/sec ±0.87% (101 runs sampled)
🤞 json-joy Tree<number, number> x 1,028,523 ops/sec ±0.15% (99 runs sampled)
🤞 json-joy RadixTree x 149,672 ops/sec ±0.09% (100 runs sampled)
Fastest is 🤞 json-joy Tree<number, number>
------------------------------------------------------------ 1000 natural numbers from 1000 to 5995
🤞 Array<number> x 81,311 ops/sec ±0.11% (97 runs sampled)
🤞 Record<number, number> x 55,586 ops/sec ±1.07% (98 runs sampled)
🤞 Map<number, number> x 55,294 ops/sec ±0.57% (92 runs sampled)
🤞 json-joy AvlBstNumNumMap x 30,050 ops/sec ±0.07% (102 runs sampled)
🤞 json-joy Tree<number, number> x 110,875 ops/sec ±0.15% (102 runs sampled)
🤞 json-joy RadixTree x 9,982 ops/sec ±0.78% (100 runs sampled)
Fastest is 🤞 json-joy Tree<number, number>
--------------------------------------------------------- 10000 natural numbers from 10000 to 59995
🤞 Array<number> x 1,101 ops/sec ±0.30% (95 runs sampled)
🤞 Record<number, number> x 1,138 ops/sec ±1.12% (95 runs sampled)
🤞 Map<number, number> x 2,237 ops/sec ±0.29% (98 runs sampled)
🤞 json-joy AvlBstNumNumMap x 2,364 ops/sec ±0.22% (98 runs sampled)
🤞 json-joy Tree<number, number> x 10,012 ops/sec ±1.63% (90 runs sampled)
🤞 json-joy RadixTree x 821 ops/sec ±0.13% (98 runs sampled)
Fastest is 🤞 json-joy Tree<number, number>
------------------------------------------------------ 100000 natural numbers from 100000 to 599995
🤞 Array<number> x 116 ops/sec ±1.20% (86 runs sampled)
🤞 Record<number, number> x 119 ops/sec ±1.84% (78 runs sampled)
🤞 Map<number, number> x 220 ops/sec ±1.01% (87 runs sampled)
🤞 json-joy AvlBstNumNumMap x 208 ops/sec ±0.11% (89 runs sampled)
🤞 json-joy Tree<number, number> x 689 ops/sec ±0.27% (59 runs sampled)
🤞 json-joy RadixTree x 47.24 ops/sec ±2.63% (63 runs sampled)
Fastest is 🤞 json-joy Tree<number, number>
--------------------------------------------------------------- 1000 natural numbers from 1000 to 1
🤞 Array<number> x 106,603 ops/sec ±5.38% (88 runs sampled)
🤞 Record<number, number> x 117,836 ops/sec ±5.51% (89 runs sampled)
🤞 Map<number, number> x 54,106 ops/sec ±0.39% (93 runs sampled)
🤞 json-joy AvlBstNumNumMap x 24,021 ops/sec ±0.11% (102 runs sampled)
🤞 json-joy Tree<number, number> x 105,367 ops/sec ±0.10% (102 runs sampled)
🤞 json-joy RadixTree x 10,866 ops/sec ±0.13% (101 runs sampled)
Fastest is 🤞 Record<number, number>
-------------------------------------------------------------------------------- Random 100 numbers
🤞 Array<number> x 907,610 ops/sec ±0.19% (100 runs sampled)
🤞 Record<number, number> x 1,048,679 ops/sec ±0.58% (99 runs sampled)
🤞 Map<number, number> x 733,138 ops/sec ±0.18% (100 runs sampled)
🤞 json-joy AvlBstNumNumMap x 488,959 ops/sec ±0.10% (101 runs sampled)
🤞 json-joy Tree<number, number> x 136,665 ops/sec ±0.15% (100 runs sampled)
🤞 json-joy RadixTree x 262,989 ops/sec ±0.13% (99 runs sampled)
Fastest is 🤞 Record<number, number>
------------------------------------------------------------------------------- Random 1000 numbers
🤞 Array<number> x 91,120 ops/sec ±0.17% (96 runs sampled)
🤞 Record<number, number> x 98,846 ops/sec ±0.13% (99 runs sampled)
🤞 Map<number, number> x 64,061 ops/sec ±0.67% (92 runs sampled)
🤞 json-joy AvlBstNumNumMap x 30,599 ops/sec ±1.48% (92 runs sampled)
🤞 json-joy Tree<number, number> x 5,277 ops/sec ±0.22% (97 runs sampled)
🤞 json-joy RadixTree x 12,786 ops/sec ±0.11% (95 runs sampled)
Fastest is 🤞 Record<number, number>
```
