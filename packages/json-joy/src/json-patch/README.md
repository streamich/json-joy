# JSON Patch+

Utilities which apply and validate JSON Patches.

This library implements three sets of operations (together known as JSON Patch+):

- [JSON Patch](./docs/json-patch.md)
- [JSON Predicate](./docs/json-predicate.md)
- [JSON Patch Extended](./docs/json-patch-extended.md)

JSON Patch+ patches can be serialized in a number of ways, see [codecs](./codec/README.md).

## Examples

Apply a JSON Patch.

```js
import {applyPatch} from 'json-joy/{lib,es6,esm}/json-patch';

const doc = {foo: {bar: 123}};

const patch = [{op: 'add', path: '/foo/baz', value: 666}];

const result = applyPatch(doc, patch, false);

console.log(result.doc);
// { foo: { bar: 123, baz: 666 } }
// -------------------^^^^^^^^
```

Validate operations.

```js
import {validateOperations} from 'json-joy/{lib,es6,esm}/json-patch';

validateOperations(patch);
```
