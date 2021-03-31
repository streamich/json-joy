# JSON Pack

Fast and lean implementation of [MsgPack](https://github.com/msgpack/msgpack/blob/master/spec.md) codec.

- Small footprint
- Fast
- Works in Node.js and browser
- Supports binary fields
- Supports extensions


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
