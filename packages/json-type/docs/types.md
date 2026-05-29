## Type builder

`t` is the default `TypeBuilder` --- a single instance you import and use to
construct types. Every method returns a chainable type object whose
`.getSchema()` produces the serializable AST.

```ts
import {t} from '@jsonjoy.com/json-type';

const User = t.Object(
  t.Key('id', t.str),
  t.Key('name', t.str),
  t.KeyOpt('age', t.num),
);
```

Two styles cover the same kinds:

| Style | When to use |
|---|---|
| `t.Object(...)`, `t.Array(...)`, `t.String(...)` | Capitalized constructors; accept options. |
| `t.object({...})`, `t.array(...)`, `t.string()` | Lowercase shorthands; record-style for objects. |

Bare getters skip even the parentheses for parameterless types:

```ts
t.str;   // === t.String()
t.num;   // === t.Number()
t.bool;  // === t.Boolean()
t.bin;   // === t.Binary(t.any)
t.any;   // === t.Any()
```


## Kinds

A type's `kind` is its discriminator in the schema AST. The full set:

| Kind | Builder | TypeScript |
|---|---|---|
| `any` | `t.any`, `t.Any()` | `unknown` |
| `con` | `t.Const(v)`, `t.con(v)` | literal `v` |
| `bool` | `t.bool`, `t.Boolean()` | `boolean` |
| `num` | `t.num`, `t.Number({format})` | `number` |
| `str` | `t.str`, `t.String({format, min, max})` | `string` |
| `bin` | `t.bin`, `t.Binary(inner, {format})` | `Uint8Array` |
| `arr` | `t.Array(item)`, `t.Tuple([a,b,c])` | `T[]` or tuple |
| `obj` | `t.Object(...keys)`, `t.object({...})` | object |
| `map` | `t.Map(value)` | `Record<string, V>` |
| `or` | `t.Or(a, b, c)`, `t.enum(...)` | union |
| `ref` | `t.Ref('alias-id')` | resolved alias type |
| `fn` / `fn$` | `t.Function(req, res)`, `t.Function$(req, res)` | promise / observable function |


## Primitives

```ts
t.str;                                 // any string
t.String({format: 'ascii', min: 1, max: 64});

t.num;                                 // any JSON number
t.Number({format: 'u32', gte: 0});     // u8|u16|u32|u64|i8|...|f32|f64

t.bool;
t.Const(true);                         // narrow literal
```

`format` on `num` and `str` is a hint that lets the codecs and validator
emit tighter code (integer ranges, ASCII fast paths).


## Objects

`t.Object(...keys)` takes one `KeyType` per field; `t.Key` for required,
`t.KeyOpt` for optional. Order is preserved.

```ts
const User = t.Object(
  t.Key('id', t.str),
  t.Key('name', t.str),
  t.KeyOpt('email', t.str),
  t.Key('verified', t.bool),
);
```

`t.object({...})` is the record-style shorthand --- shorter, but field
order is whatever `Object.entries` returns:

```ts
const User = t.object({
  id: t.str,
  name: t.str,
  verified: t.bool,
}).opt('email', t.str);
```

`.prop(key, value)` / `.opt(key, value)` chain new fields onto an existing
object. `.extend(other)`, `.omit(key)`, and `.pick(key)` derive new object
types from this one.


## Arrays and tuples

```ts
t.Array(t.num);                                  // number[]
t.Array(t.str, {min: 1, max: 10});               // bounded

// Fixed-length tuple
t.Tuple([t.str, t.num, t.bool]);                 // [string, number, boolean]

// Tuple with variable middle
t.Tuple([t.str], t.num, [t.bool]);               // [string, ...number[], boolean]
```


## Maps

`Map` is an object whose keys are unknown but whose values share a type.

```ts
t.Map(t.num);                                    // {[k: string]: number}
t.Map(t.Array(t.str), t.String({format: 'ascii'}));
```


## Unions

```ts
t.Or(t.str, t.num);                              // string | number
t.enum('red', 'green', 'blue');                  // 'red' | 'green' | 'blue'
t.maybe(t.str);                                  // string | undefined
```

Every `or` carries a `discriminator` expression which the validator and
codecs use to pick a branch without trial-and-error. The default uses
`['num', -1]` (no discriminator); for unions of objects with a tag field,
set `.discriminator(['=', '$.kind'])` or similar.


## References

```ts
t.Ref('User');                                   // resolved through ModuleType
```

A ref is only meaningful inside a `ModuleType`. See
[Modules](/libs/json-type/modules).


## Functions

`fn` and `fn$` describe a request/response procedure --- unary and
streaming (RxJS) respectively. They mostly exist so RPC stacks can wire a
procedure's IO types into the same schema system.

```ts
const Echo = t.Function(t.str, t.str);
const Counter = t.Function$(t.undef, t.num);     // streaming
```

See [Modules](/libs/json-type/modules) for how `fn` slots into a module
alongside data types.


## Options shared by all kinds

Every type accepts the same display and metadata options. Set them via
`.options({...})` or the typed accessors:

```ts
t.str
  .title('User name')
  .description('Display name, 1-64 chars.')
  .example('Alice')
  .default('anonymous')
  .options({min: 1, max: 64});
```

| Option | Effect |
|---|---|
| `title`, `intro`, `description` | Human-readable text. Used by JSON Schema and TS export. |
| `examples` | List of example values. |
| `default` | Default value (used by RPC defaults, docs). |
| `deprecated` | `{info?}` to mark a type as deprecated. |
| `meta`, `metadata` | Free-form passthrough for your codegen. |


## Inferring the TypeScript type

`t.infer<typeof T>` resolves a builder back to its TypeScript shape:

```ts
const User = t.object({id: t.str, name: t.str}).opt('email', t.str);

type User = t.infer<typeof User>;
// {id: string; name: string; email?: string}
```


## Schema-only mode

If you don't need the chainable wrappers, use `s` to build the raw
schema AST directly:

```ts
import {s} from '@jsonjoy.com/json-type';

const userSchema = s.Object({
  decodeUnknownKeys: false,
  keys: [s.Key('id', s.str), s.KeyOpt('name', s.str)],
});
```

`s.*` returns plain POJOs; `t.import(schema)` lifts a POJO back into a
chainable type. Codegen accepts either.
