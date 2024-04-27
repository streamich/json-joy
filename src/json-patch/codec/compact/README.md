# `compact` codec for JSON Patch+ patches

`compact` encodes JSON Patch+ operations using JSON arrays. It is designed to
consume very little physical space, yet still be simple to reason about.

Operations are encoded using JSON objects, for example, `add` operations:

```json
[0, ["foo", "bar"], 123]
```

Same operation in nominal [`json` encoding](../json/README.md):

```json
{"op": "add", "path": "/foo/bar", "value": 123}
```

## Usage

```ts
import {OpTest, OpReplace} from 'json-joy/{lib,es6,ems}/json-patch';
import {encode, decode} from 'json-joy/{lib,es6,ems}/json-patch/codec/compact';

const patch = [new OpTest('/foo', 'bar'), new OpReplace('/foo', 'baz')];

const encoded = encode(patch);
const decoded = decode(encoded);
```
