JSON CRDT Patch specifies 3 serialization formats: "json", "compact", and "binary".
This sub-library implements all 3 formats. The "binary" format is built-in into
the `Patch` class, and the "json" and "compact" formats are implemented as
separate modules.


## The `json` serialization format

Import the `encode()` and `decode()` functions from the "json" codec module.

```ts
import {encode, decode} from 'json-joy/.../json-crdt-patch/codec/json';
```

The `encode()` function accepts a `Patch` object and returns a JSON POJO. The
`decode()` reverses the process, it accepts a JSON POJO and returns a `Patch`

```ts
const patch = builder.json('hello');
const pojo = encode(patch);

console.log(JSON.stringify(pojo, null, 2));
// {
//   "id": [123, 456],
//   "ops": [
//     { "op": "str" },
//     { "op": "ins_str", "obj": [123, 456],
//       "after": [123, 456], "value": "hello" }
//   ]
// }

const patch2 = decode(pojo);
```

The "json" codec module also exports the TypeScript types for the "json" codec.
See [module reference](https://streamich.github.io/json-joy/modules/json_crdt_patch_codec_json.html) for more details.


## The `compact` serialization format

Import the `encode()` and `decode()` functions from the "compact" codec module.

```ts
import {encode, decode} from 'json-joy/.../json-crdt-patch/codec/compact';
```

The `encode()` function accepts a `Patch` object and returns a JSON POJO. The
`decode()` reverses the process, it accepts a JSON POJO and returns a `Patch`

```ts
const patch = builder.json('hello');
const pojo = encode(patch);

console.log(JSON.stringify(pojo, null, 2));
// [
//   [
//     [123, 456]
//   ],
//   [4],
//   [12, -1, -1, "hello"],
// ]

const patch2 = decode(pojo);
```

The "compact" codec module also exports the TypeScript types for the "compact" codec.
See [module reference](https://streamich.github.io/json-joy/modules/json_crdt_patch_codec_compact.html) for more details.


## The `binary` serialization format

The "binary" serialization format is built-in into the `Patch` class. The
`Patch` class has a `.toBinary()` method which returns a `Uint8Array` object,
and a static `.fromBinary()` method which accepts a `Uint8Array` object and
returns a `Patch` object.

```ts
const binary = patch.toBinary();
const patch2 = Patch.fromBinary(binary);
```

Alternatively, one can also import the `encode()` and `decode()` functions from the "binary" codec module.

```ts
import {encode, decode} from 'json-joy/.../json-crdt-patch/codec/binary';
```

The `encode()` function accepts a `Patch` object and returns a `Uint8Array` blob. The
`decode()` reverses the process, it accepts a blob and returns a `Patch`

```ts
const patch = builder.json('hello');
const binary = encode(patch);

console.log(JSON.stringify(binary, null, 2));
// Uint8Array(16) [
//   123,   1, 200,   3, 246,   4,
//   172,   1,   0,   1,   0, 104,
//   101, 108, 108, 111
// ]


const patch2 = decode(binary);
```

The "binary" codec module also exports the TypeScript types for the "compact" codec.
See [module reference](https://streamich.github.io/json-joy/modules/json_crdt_patch_codec_binary.html) for more details.
