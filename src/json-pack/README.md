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
json-joy/json-pack x 303,242 ops/sec ±1.05% (90 runs sampled), 3298 ns/op
JSON.stringify x 249,785 ops/sec ±0.49% (87 runs sampled), 4003 ns/op
@msgpack/msgpack x 196,933 ops/sec ±0.66% (92 runs sampled), 5078 ns/op
msgpack-lite x 55,664 ops/sec ±1.46% (92 runs sampled), 17965 ns/op
msgpack x 36,592 ops/sec ±0.91% (91 runs sampled), 27328 ns/op
msgpack5 x 15,466 ops/sec ±0.55% (92 runs sampled), 64660 ns/op
messagepack x 9,249 ops/sec ±2.33% (83 runs sampled), 108122 ns/op
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
