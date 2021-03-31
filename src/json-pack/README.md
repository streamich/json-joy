# JSON Pack

Fast and lean implementation of [MessagePack](https://github.com/msgpack/msgpack/blob/master/spec.md) codec.

- Fast, fastest implementation of MsgPack in JavaScript.
- Small footprint, small bundle size.
- Works in Node.js and browser.
- Supports binary fields.
- Supports extensions.


## Benchmarks

2x slower than `JSON.stringify`, but 2.5x faster than closest competition.

```
node benchmarks/json-pack.js 
JSON.stringify x 260,717 ops/sec ±0.76% (91 runs sampled), 3836 ns/op
json-pack x 119,985 ops/sec ±1.17% (88 runs sampled), 8334 ns/op
msgpack-lite x 56,971 ops/sec ±1.05% (88 runs sampled), 17553 ns/op
msgpack5 x 16,547 ops/sec ±0.98% (91 runs sampled), 60433 ns/op
```


## Usage

Basic usage:

```ts
import {encode, decode} from 'json-joy/json-pack';

const buffer = encode({foo: 'bar'});
const obj = decode(buffer);

console.log(obj); // { foo: 'bar' }
```

Encode binary data using `ArrayBuffer`:

```ts
import {encode, decode} from 'json-joy/json-pack';

const buffer = encode({foo: new Uint8Array([1, 2, 3]).buffer});
const obj = decode(buffer);
console.log(obj); // { foo: ArrayBuffer { [1, 2, 3] } }
```

Encode Msgpack value as is:

```ts
import {encode, decode, JsonPackValue} from 'json-joy/json-pack';

const buffer = encode({foo: 'bar'});
const value = new JsonPackValue(buffer);
const buffer2 = encode({baz: value});

const obj = decode(buffer2);
console.log(obj); // { baz: { foo: 'bar' } }
```

Encode Msgpack extension:

```ts
import {encode, decode, JsonPackExtension} from 'json-joy/json-pack';

const ext = new JsonPackExtension(1, new Uint8Array(8));
const buffer = encode({foo: ext});

const obj = decode(buffer2);
console.log(obj); // { foo: JsonPackExtension } 
```
