# JSON Pack

Fast and lean implementation of [MessagePack](https://github.com/msgpack/msgpack/blob/master/spec.md) codec.

- Fast, fastest implementation of MessagePack in JavaScript.
- Small footprint, small bundle size.
- Works in Node.js and browser.
- Supports binary fields.
- Supports extensions.


## Benchmarks

Faster than `JSON.stringify`:

```
node benchmarks/json-pack.js 
json-joy/json-pack x 264,636 ops/sec ±0.83% (86 runs sampled), 3779 ns/op
JSON.stringify x 231,641 ops/sec ±1.15% (93 runs sampled), 4317 ns/op
@msgpack/msgpack x 163,779 ops/sec ±1.62% (90 runs sampled), 6106 ns/op
msgpack-lite x 43,798 ops/sec ±1.75% (89 runs sampled), 22832 ns/op
msgpack x 27,162 ops/sec ±0.80% (87 runs sampled), 36816 ns/op
msgpack5 x 10,994 ops/sec ±0.70% (89 runs sampled), 90963 ns/op
messagepack x 6,590 ops/sec ±2.89% (78 runs sampled), 151754 ns/op
```


## Usage

Basic usage:

```ts
import {Encoder, decode} from 'json-joy/json-pack';

const encoder = new Encoder();
const buffer = encoder.encode({foo: 'bar'});
const obj = decode(buffer);

console.log(obj); // { foo: 'bar' }
```

Encode binary data using `ArrayBuffer`:

```ts
import {Encoder, decode} from 'json-joy/json-pack';

const encoder = new Encoder();
const buffer = encoder.encode({foo: new Uint8Array([1, 2, 3]).buffer});
const obj = decode(buffer);
console.log(obj); // { foo: ArrayBuffer { [1, 2, 3] } }
```

Encode Msgpack value as is:

```ts
import {Encoder, decode, JsonPackValue} from 'json-joy/json-pack';

const encoder = new Encoder();
const buffer = encoder.encode({foo: 'bar'});
const value = new JsonPackValue(buffer);
const buffer2 = encode({baz: value});

const obj = decode(buffer2);
console.log(obj); // { baz: { foo: 'bar' } }
```

Encode Msgpack extension:

```ts
import {Encoder, decode, JsonPackExtension} from 'json-joy/json-pack';

const ext = new JsonPackExtension(1, new Uint8Array(8));
const encoder = new Encoder();
const buffer = encoder.encode({foo: ext});

const obj = decode(buffer2);
console.log(obj); // { foo: JsonPackExtension } 
```
