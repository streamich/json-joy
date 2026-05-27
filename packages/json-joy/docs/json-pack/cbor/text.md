`json-pack` implements fast [CBOR][cbor] encoder and decoder. It is written in TypeScript
and has no external dependencies.


[cbor]: https://cbor.io/


## Getting started

~~~jj.note
[Try this example][link] without installation on RunKit.

[link]: https://runkit.com/streamich/json-joy-json-pack-cbor-codec
~~~

To get started you need to import `CborEncoder` and `CborDecoder` classes like
this:

```ts
import {CborEncoder} from 'json-joy/es2020/json-pack/cbor/CborEncoder';
import {CborDecoder} from 'json-joy/es2020/json-pack/cbor/CborDecoder';
```

The `CborDecoder` implements full decoding feature set including advanced
features like value skipping and decoding one level at-a-time. Those features
are not necessary for most use cases, to save on bundle size you can import
the "base" decoder instead:

```ts
import {CborDecoderBase} from 'json-joy/es2020/json-pack/cbor/CborDecoderBase';
```

The base decoder implements all CBOR decoding features except for the advanced
shallow decoding features, like skipping, one level at-a-time decoding.


## Usage

Encode a JavaScript POJO to CBOR:

```ts
const encoder = new CborEncoder();

const pojo = {
  id: 123,
  foo: 'bar',
  tags: ['a', 'b', 'c'],
  nested: {
    a: 1,
    b: 2,
    level2: {
      c: 3,
    }
  },
};

const encoded = encoder.encode(pojo);
console.log(encoded);
// Uint8Array(53) [
//   164,  98, 105, 100,  24, 123,  99, 102, 111, 111,
//    99,  98,  97, 114, 100, 116,  97, 103, 115, 131,
//    97,  97,  97,  98,  97,  99, 120,   6, 110, 101,
//   115, 116, 101, 100, 163,  97,  97,   1,  97,  98,
//     2, 120,   6, 108, 101, 118, 101, 108,  50, 161,
//    97,  99,   3
// ]
```

Decode CBOR back to JavaScript POJO:

```ts
const decoderBase = new CborDecoderBase();
const decoded = decoderBase.read(encoded);

console.log(decoded);
// {
//   id: 123,
//   foo: 'bar',
//   tags: [ 'a', 'b', 'c' ],
//   nested: { a: 1, b: 2, level2: { c: 3 } }
// }
```
