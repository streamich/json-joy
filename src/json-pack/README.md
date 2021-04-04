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
json-joy/json-pack x 376,192 ops/sec ±0.49% (93 runs sampled), 2658 ns/op
JSON.stringify x 242,030 ops/sec ±0.50% (93 runs sampled), 4132 ns/op
@msgpack/msgpack x 188,164 ops/sec ±0.95% (89 runs sampled), 5315 ns/op
msgpack-lite x 54,859 ops/sec ±1.55% (87 runs sampled), 18229 ns/op
msgpack x 36,078 ops/sec ±0.79% (91 runs sampled), 27718 ns/op
msgpack5 x 11,850 ops/sec ±0.78% (89 runs sampled), 84388 ns/op
messagepack x 8,972 ops/sec ±2.34% (82 runs sampled), 111457 ns/op
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
