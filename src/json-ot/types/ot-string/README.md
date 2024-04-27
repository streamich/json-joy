# ot-string

This is a re-implementation of a JavaScript string OT type, inspired by
`text0` type from `otttypes`.

- String is a sequence of JavaScript UTF-16 characters.
- _ot-string_ operations are a list of components.
- There are three types of components:
  - Retain: a number of characters to retain and move the cursor forward.
  - Insert: a string to insert at the cursor position.
  - Delete: a number of characters to delete and move the cursor backward.
- The delete component can be encoded in two ways:
  - As a number which specifies how many characters to delete.
  - As a string which specifies the characters to delete.

An ot-string operation is a JSON array of components. Where each component is
encoded as follows:

- Retail: positive integer.
- Insert: string.
- Delete: negative integer or a string in a one element array.

## Operations

Here is an example operation:

```js
[5, 'inserted', -1, 3, ['deleted']];
```

## Encoding

This form of operation encoding results in most efficient binary encoding using MessagePack.

Consider operation:

```
[5, "hello", -4]
```

- Array is encoded as one byte fixarr.
- 5 is encoded as one byte fixint.
- String header is encoded as one byte fixstr followed by 5 bytes of UTF-8 string.
- -4 is encoded as one byte fixint.

## Benchmarks

`apply()` function:

```
node benchmarks/json-ot/ot-string.apply.js
json-joy/json-ot ot-string x 1,854,289 ops/sec ±3.35% (64 runs sampled), 539 ns/op
json-joy/json-ot ot-string (reversible) x 1,908,440 ops/sec ±2.64% (78 runs sampled), 524 ns/op
json-joy/json-ot ot-string-irreversible x 2,570,753 ops/sec ±2.42% (55 runs sampled), 389 ns/op
ottypes/ot-text x 1,019,892 ops/sec ±4.06% (72 runs sampled), 980 ns/op
ottypes/ot-text-unicode x 967,073 ops/sec ±5.52% (66 runs sampled), 1034 ns/op
quilljs/delta x 89,151 ops/sec ±2.37% (72 runs sampled), 11217 ns/op
Fastest is json-joy/json-ot ot-string-irreversible
```

`compose()` and `transform()` functions:

```
node benchmarks/json-ot/ot-string.compose-and-transform.js
json-joy/json-ot ot-string x 224,073 ops/sec ±3.42% (72 runs sampled), 4463 ns/op
json-joy/json-ot ot-string (reversible) x 176,814 ops/sec ±2.95% (61 runs sampled), 5656 ns/op
json-joy/json-ot ot-string-irreversible x 265,452 ops/sec ±2.92% (78 runs sampled), 3767 ns/op
ottypes/ot-text x 202,199 ops/sec ±4.16% (64 runs sampled), 4946 ns/op
ottypes/ot-text-unicode x 191,650 ops/sec ±2.96% (72 runs sampled), 5218 ns/op
quilljs/delta x 16,050 ops/sec ±3.56% (58 runs sampled), 62305 ns/op
Fastest is json-joy/json-ot ot-string-irreversible
```

Operation serialization:

```
node benchmarks/json-ot/ot-string.serialization.js
json-pack encode() x 883,195 ops/sec ±3.60% (79 runs sampled), 1132 ns/op
JSON.stringify() x 1,548,226 ops/sec ±3.11% (76 runs sampled), 646 ns/op
toJson() x 1,017,601 ops/sec ±3.57% (69 runs sampled), 983 ns/op
Fastest is JSON.stringify()
```
