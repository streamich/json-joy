`json-pack` implements fast [MessagePack][msgpack] encoder and decoder. It is written in TypeScript
and has no external dependencies.


[msgpack]: https://msgpack.org/


## Getting started

To get started you need to import `MsgPackEncoder` and `MsgPackDecoder` classes like
this:

```ts
import {MsgPackEncoder} from 'json-joy/es2020/json-pack/msgpack/MsgPackEncoder';
import {MsgPackDecoder} from 'json-joy/es2020/json-pack/msgpack/MsgPackDecoder';
```


## Usage

Encode a JavaScript POJO to MessagePack:

```ts
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
const encoder = new MsgPackEncoder();
const encoded = encoder.encode(pojo);

console.log(encoded);
// Uint8Array(50) [
//   132, 162, 105, 100, 123, 163, 102, 111, 111,
//   163,  98,  97, 114, 164, 116,  97, 103, 115,
//   147, 161,  97, 161,  98, 161,  99, 166, 110,
//   101, 115, 116, 101, 100, 131, 161,  97,   1,
//   161,  98,   2, 166, 108, 101, 118, 101, 108,
//    50, 129, 161,  99,   3
// ]
```

Decode MessagePack back to JavaScript POJO:

```ts
const decoder = new MsgPackDecoder();
const decoded = decoder.read(encoded);

console.log(decoded);
// {
//   id: 123,
//   foo: 'bar',
//   tags: [ 'a', 'b', 'c' ],
//   nested: { a: 1, b: 2, level2: { c: 3 } }
// }
```
