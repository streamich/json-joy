Utilities which apply and validate JSON Patches.

## Usage

Apply a [JSON Patch][json-patch].

```js
import {applyPatch} from 'json-joy/es6/json-patch';

const doc = { foo: { bar: 123 } };

const patch = [
  {op: 'add', path: '/foo/baz', value: 666},
];

const result = applyPatch(doc, patch, false);

console.log(result.doc);
// { foo: { bar: 123, baz: 666 } }
// -------------------^^^^^^^^
```

Validate operations.

```js
import {validateOperations} from 'json-joy/es6/json-patch';

validateOperations(patch);
```


## JSON Patch+ Operations

This library implements three sets of operations (together referred as _JSON Patch+_):

- [JSON Patch](#JSON-Patch)
- [JSON Predicate](#JSON-Predicate)
- [JSON Patch Extended](#JSON-Patch-Extended)


### JSON Patch

All [JSON Patch][json-patch] operations are implemented, which includes:

- `add`
- `remove`
- `replace`
- `move`
- `copy`
- `test`

The `test` operation is further extended with optional `not` property. If `not`
is set to `true`, the result of `test` operation is inverted.

[json-patch]: https://tools.ietf.org/html/rfc6902


### JSON Predicate

All [JSON Predicate][json-predicate] operations are implemented, which includes:

- `test`
- `contains`
- `defined`
- `ends`
- `in`
- `less`
- `matches`
- `more`
- `starts`
- `test`
- `type`
- `undefined`
- `and`
- `not`
- `or`

Only a subset of types supported by `type` operation are implemented.

By default `validateOperations` does not allow `match` operation, as it uses
regular expressions and be exploited using ReDoS attacks, but you can allow it
through options argument.

[json-predicate]: https://tools.ietf.org/id/draft-snell-json-test-01.html


### JSON Patch Extended

`experimental` A number of additional non-standard JSON Patch operations useful
for collaborative editing. These operations are not part of any standard and
are likely to change in the future, use at your own risk.

- `flip`
- `inc`
- `str_ins`
- `str_del`
- `split`
- `merge`
- `extend`
- `test_type`
- `test_string`
- `test_string_len`


## Codecs

JSON Patch+ patches can be serialized in a number of ways, three codecs are implemented:

- [JSON codec](#JSON-codec)
- [Compact codec](#Compact-codec)
- [Binary codec](#Binary-codec)


### JSON codec

`json` codec implements the nominal human-friendly encoding of JSON Patch+
operations like described [JSON Patch specification](https://datatracker.ietf.org/doc/html/rfc6902).

Operations are encoded using JSON objects, for example, `add` operations:

```json
{ "op": "add", "path": "/foo/bar", "value": 123 }
```


#### Usage

```ts
import {OpTest, OpReplace} from 'json-joy/{lib,es6,ems}/json-patch';
import {encode, decode} from 'json-joy/{lib,es6,ems}/json-patch/codec/json';

const patch = [
  new OpTest('/foo', 'bar'),
  new OpReplace('/foo', 'baz'),
];

const encoded = encode(patch);
const decoded = decode(encoded);
```


### Compact codec

`compact` encodes JSON Patch+ operations using JSON arrays. It is designed to
consume very little physical space, yet still be simple to reason about.

Operations are encoded using JSON objects, for example, `add` operations:

```json
[0, ["foo", "bar"], 123]
```

Same operation in nominal [`json` encoding](../json/README.md):

```json
{ "op": "add", "path": "/foo/bar", "value": 123 }
```


#### Usage

```ts
import {OpTest, OpReplace} from 'json-joy/{lib,es6,ems}/json-patch';
import {encode, decode} from 'json-joy/{lib,es6,ems}/json-patch/codec/compact';

const patch = [
  new OpTest('/foo', 'bar'),
  new OpReplace('/foo', 'baz'),
];

const encoded = encode(patch);
const decoded = decode(encoded);
```


### Binary codec

`binary` encodes JSON Patch+ operations in the same shape as Compact codec,
but serializes it into binary MessagePack format instead of textual JSON.

The implementation in this folder is efficient as it does not create
intermediary `compact` representation&mdash;instead it goes straight to
MessagePack from JSON Patch+ operations.


#### Usage

```ts
import {OpTest, OpReplace} from 'json-joy/{lib,es6,ems}/json-patch';
import {Encoder, Decoder} from 'json-joy/{lib,es6,ems}/json-patch/codec/binary';

const encoder = new Encoder();
const decoder = new Decoder();

const patch = [
  new OpTest('/foo', 'bar'),
  new OpReplace('/foo', 'baz'),
];

const encoded = encoder.encode(patch);
const decoded = decoder.decode(encoded);
```
