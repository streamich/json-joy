# BSON

Performant implementation of [BSON][bson] (Binary JSON) for JavaScript.

[bson]: https://bsonspec.org/

## Overview

BSON (Binary JSON) is a binary representation of JSON-like documents. It extends JSON's data model to provide additional data types, ordered fields, and efficient encoding and decoding.

## Features

- High-performance BSON encoding and decoding
- Support for all BSON data types including:
  - ObjectId
  - Binary data
  - Dates
  - Regular expressions
  - JavaScript code
- MongoDB-compatible implementation
- Efficient binary representation

## Usage

Note: BsonEncoder requires a Writer instance from the `@jsonjoy.com/util` package. Make sure to install it as a peer dependency:

```bash
npm install @jsonjoy.com/util
```

### Basic Usage

```ts
import {BsonEncoder, BsonDecoder} from '@jsonjoy.com/json-pack/lib/bson';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';

const writer = new Writer();
const encoder = new BsonEncoder(writer);
const decoder = new BsonDecoder();

const data = {
  name: 'example',
  created: new Date(),
  binary: new Uint8Array([1, 2, 3])
};

const encoded = encoder.encode(data);
const decoded = decoder.decode(encoded);

console.log(decoded); // Original data with BSON types preserved
```

### Alternative: Use simpler codecs

For easier usage without external dependencies, consider using MessagePack or CBOR codecs instead:

```ts
import {MessagePackEncoder, MessagePackDecoder} from '@jsonjoy.com/json-pack/lib/msgpack';
// ... simpler usage
```


## Benchmarks

```
npx ts-node benchmarks/json-pack/bench.bson.encoding.ts
=============================================================================== Benchmark: Encoding
Warmup: 1000x , Node.js: v20.4.0 , Arch: arm64 , CPU: Apple M1
----------------------------------------------------------------------------- Combined, 63374 bytes
👍 json-pack JsonEncoder x 4,604 ops/sec ±0.12% (100 runs sampled)
👎 json-pack BsonEncoder x 3,962 ops/sec ±0.18% (100 runs sampled)
👎 bson BSON.serialize() x 1,439 ops/sec ±0.19% (100 runs sampled)
👍 bson Buffer.from(EJSON.stringify()) x 1,699 ops/sec ±0.11% (100 runs sampled)
Fastest is 👍 json-pack JsonEncoder
---------------------------------------------------------------------------- Small object, 53 bytes
👍 json-pack JsonEncoder x 4,464,852 ops/sec ±0.47% (96 runs sampled)
👎 json-pack BsonEncoder x 3,684,236 ops/sec ±0.18% (100 runs sampled)
👎 bson BSON.serialize() x 884,917 ops/sec ±0.14% (99 runs sampled)
👍 bson Buffer.from(EJSON.stringify()) x 1,153,616 ops/sec ±0.16% (98 runs sampled)
Fastest is 👍 json-pack JsonEncoder
------------------------------------------------------------------------ Typical object, 1002 bytes
👍 json-pack JsonEncoder x 306,241 ops/sec ±0.22% (100 runs sampled)
👎 json-pack BsonEncoder x 368,051 ops/sec ±0.17% (100 runs sampled)
👎 bson BSON.serialize() x 106,583 ops/sec ±0.84% (99 runs sampled)
👍 bson Buffer.from(EJSON.stringify()) x 126,497 ops/sec ±0.12% (99 runs sampled)
Fastest is 👎 json-pack BsonEncoder
-------------------------------------------------------------------------- Large object, 3750 bytes
👍 json-pack JsonEncoder x 91,646 ops/sec ±0.76% (100 runs sampled)
👎 json-pack BsonEncoder x 109,402 ops/sec ±0.17% (100 runs sampled)
👎 bson BSON.serialize() x 35,037 ops/sec ±0.19% (98 runs sampled)
👍 bson Buffer.from(EJSON.stringify()) x 39,504 ops/sec ±0.49% (101 runs sampled)
Fastest is 👎 json-pack BsonEncoder
-------------------------------------------------------------------- Very large object, 45759 bytes
👍 json-pack JsonEncoder x 6,234 ops/sec ±0.47% (99 runs sampled)
👎 json-pack BsonEncoder x 4,824 ops/sec ±0.20% (99 runs sampled)
👎 bson BSON.serialize() x 1,645 ops/sec ±0.17% (101 runs sampled)
👍 bson Buffer.from(EJSON.stringify()) x 2,696 ops/sec ±0.66% (98 runs sampled)
Fastest is 👍 json-pack JsonEncoder
------------------------------------------------------------------ Object with many keys, 978 bytes
👍 json-pack JsonEncoder x 260,571 ops/sec ±0.68% (96 runs sampled)
👎 json-pack BsonEncoder x 243,776 ops/sec ±0.42% (98 runs sampled)
👎 bson BSON.serialize() x 86,641 ops/sec ±0.29% (100 runs sampled)
👍 bson Buffer.from(EJSON.stringify()) x 81,730 ops/sec ±0.13% (99 runs sampled)
Fastest is 👍 json-pack JsonEncoder
------------------------------------------------------------------------- String ladder, 4046 bytes
👍 json-pack JsonEncoder x 92,381 ops/sec ±0.13% (100 runs sampled)
👎 json-pack BsonEncoder x 127,132 ops/sec ±1.03% (90 runs sampled)
👎 bson BSON.serialize() x 75,356 ops/sec ±1.18% (94 runs sampled)
👍 bson Buffer.from(EJSON.stringify()) x 47,308 ops/sec ±0.08% (101 runs sampled)
Fastest is 👎 json-pack BsonEncoder
```
