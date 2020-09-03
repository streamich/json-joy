# JSON Patch

Utilities which apply and validate [JSON Patches][json-patch].

[json-patch]: https://tools.ietf.org/html/rfc6902
[json-predicate]: https://tools.ietf.org/id/draft-snell-json-test-01.html

```js
import {applyPatch} from 'json-joy';
// or 
import {applyPatch} from 'json-joy/{lib,es6,esm}/json-patch';

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
import {validateOperations} from 'json-joy';

validateOperations(patch);
```


## JSON Patch

All [JSON Patch][json-patch] operations are implemented, which includes:

- `add`
- `remove`
- `replace`
- `move`
- `copy`
- `test`

The `test` operation is further extended with optional `not` property. If `not`
is set to `true`, the result of `test` operation is inverted.


## JSON Predicate

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


## JSON Patch Extended

A number of additional JSON Patch operations are implemented.

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
