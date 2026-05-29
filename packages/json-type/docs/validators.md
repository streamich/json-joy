## Validators

`ValidatorCodegen` takes a type and emits a single JavaScript function
optimized to validate values of that exact shape. There's no interpreter
loop, no per-field schema lookup --- the validator is a flat chunk of
`if`s and property reads.

```ts
import {t, ValidatorCodegen} from '@jsonjoy.com/json-type';

const User = t.Object(
  t.Key('id', t.str),
  t.KeyOpt('name', t.str),
  t.Key('age', t.Number({format: 'u32'})),
);

const validate = ValidatorCodegen.get({type: User, errors: 'boolean'});

validate({id: 'u_1', age: 30});          // false  (no error)
validate({id: 'u_1'});                   // true   (missing 'age')
```


## Options

```ts
interface ValidatorCodegenOptions {
  type: Type;
  errors: 'boolean' | 'string' | 'object';
  skipObjectExtraFieldsCheck?: boolean;
  unsafeMode?: boolean;
}
```

The validator returns falsy on success, truthy on failure --- the exact
shape depends on `errors`:

| `errors` | Success | Failure |
|---|---|---|
| `'boolean'` | `false` | `true` |
| `'string'` | `''` | JSON-stringified `[code, ...path]` |
| `'object'` | `null` | `{code, errno, message, path}` |

Use `'boolean'` for the hot path (it's the fastest), and a richer mode
for the developer-facing surface that needs to report what went wrong.

`skipObjectExtraFieldsCheck: true` skips the "no excess keys" check on
objects whose schemas don't allow unknown fields. In micro-benchmarks
this is ~5x faster but lets junk through silently --- safe only when the
data comes from a trusted source.


## Inspecting the generated function

```ts
console.log(validate.toString());
```

The generated code is plain JavaScript. Looking at it is the fastest way
to understand what the codegen does with a given schema, and to spot
opportunities to tighten the schema (e.g. promoting `t.num` to
`t.Number({format: 'u32'})`).


## Validation rules by kind

| Kind | Checks |
|---|---|
| `bool` | `typeof === 'boolean'` |
| `num` | `typeof === 'number'`; range from `gt`/`gte`/`lt`/`lte`; integer check if `format` is integer; `Number.isFinite`. |
| `str` | `typeof === 'string'`; length from `min`/`max`; ASCII range if `format: 'ascii'`. |
| `bin` | `instanceof Uint8Array`; length from `min`/`max`. |
| `arr` | `Array.isArray`; length bounds; per-element validation; tuple head/tail. |
| `obj` | required keys present and well-typed; optional keys validated only when present; no extras unless `decodeUnknownKeys` is `true`. |
| `map` | object check; per-value validation. |
| `con` | deep-equality with the schema's `value`. |
| `or` | runs the discriminator expression and validates the chosen branch. |
| `ref` | dispatches to the validator of the referenced alias. |
| `any` | passes. |


## Custom validators

`.validator(fn, name?)` attaches an extra runtime check that the codegen
calls after structural validation succeeds. Use it for cross-field
invariants the schema can't express.

```ts
const Range = t.Object(
  t.Key('min', t.num),
  t.Key('max', t.num),
).validator(({min, max}) => {
  if (min > max) throw new Error('MIN_MAX');
}, 'range');
```

Throw to signal failure; the codegen converts the thrown error into a
validator error in the configured `errors` format.


## Caching

`ValidatorCodegen.get(...)` is memoized on `type` --- the second call with
the same `type` reference and options returns the previously compiled
function. Build the validator once at module init and reuse it.


## When to use a validator vs. a codec

A validator only *checks* a value; codecs *transform* one. If you're
about to encode the value with one of the codecs (see
[Codecs](/libs/json-type/codecs)), you usually don't need a separate
validation pass --- the codec assumes valid input and runs in tight code.
Validate at the boundary (incoming JSON, RPC requests), then transform.
