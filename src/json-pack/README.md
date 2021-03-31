# JSON Pack

Fast and lean implementation of [MessagePack](https://github.com/msgpack/msgpack/blob/master/spec.md) codec.

- Fast, fastest implementation of MsgPack in JavaScript.
- Small footprint, small bundle size.
- Works in Node.js and browser.
- Supports binary fields.
- Supports extensions.


## Benchmarks

1.5x slower than `JSON.stringify`, but 3x faster than closest competition.

```
node benchmarks/json-pack.js 
JSON.stringify x 247,421 ops/sec ±1.12% (89 runs sampled), 4042 ns/op
json-pack x 150,702 ops/sec ±1.06% (86 runs sampled), 6636 ns/op
msgpack-lite x 55,116 ops/sec ±1.24% (88 runs sampled), 18144 ns/op
msgpack5 x 13,023 ops/sec ±0.80% (91 runs sampled), 76789 ns/op
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
