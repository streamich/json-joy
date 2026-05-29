## Interop

A `json-type` schema can be converted out to three external formats and
fed back into runtime helpers:

| Target | Function | Purpose |
|---|---|---|
| JSON Schema (Draft 2020-12) | `typeToJsonSchema(type)` | Editor tooling, API docs, third-party validators. |
| JSON Type Definition (RFC 8927) | `toJtdForm(type)` | Code generation in non-TS targets that already support JTD. |
| TypeScript AST | `toTypeScriptAst(type)` | Emit `.d.ts` declarations next to runtime types. |

Plus a `Random` generator that produces random values matching any
schema --- handy for property tests, fixtures, and fuzzing.


## JSON Schema

```ts
import {t, typeToJsonSchema} from '@jsonjoy.com/json-type';

const User = t.Object(
  t.Key('id', t.str),
  t.Key('age', t.Number({format: 'u32', gte: 0})),
);

typeToJsonSchema(User);
// {
//   type: 'object',
//   properties: {
//     id: {type: 'string'},
//     age: {type: 'integer', minimum: 0},
//   },
//   required: ['id', 'age'],
// }
```

Aliases export with `$defs` and `$ref` indirection so that recursive and
shared types stay shared:

```ts
import {aliasToJsonSchema} from '@jsonjoy.com/json-type';

const userAlias = User.alias('User');
aliasToJsonSchema(userAlias);
// {$id: 'User', $ref: '#/$defs/User', $defs: {User: {...}}}
```

Mapping highlights: integer `format`s map to `"type": "integer"`,
`format: 'ascii'` becomes a pattern, `con` becomes `"const"`,
`or` becomes `"anyOf"`, and `bin` exports as a `binary` extension type.


## JSON Type Definition

```ts
import {t, toJtdForm} from '@jsonjoy.com/json-type';

const User = t.Object(
  t.Key('id', t.str),
  t.KeyOpt('email', t.str),
);

toJtdForm(User);
// {properties: {id: {type: 'string'}}, optionalProperties: {email: {type: 'string'}}}
```

JTD's eight forms (`empty`, `type`, `enum`, `elements`, `properties`,
`values`, `discriminator`, `ref`) map onto the corresponding kinds. Use
JTD when your downstream code generator (e.g. `jtd-codegen`) targets a
language other than TypeScript.


## TypeScript AST

`toTypeScriptAst` returns an in-memory AST you can serialize with
`toText`:

```ts
import {t, toTypeScriptAst, toText} from '@jsonjoy.com/json-type';

const User = t.Object(
  t.Key('id', t.str),
  t.KeyOpt('name', t.str),
);

const ast = toTypeScriptAst(User);
toText(ast);
// '{id: string; name?: string}'
```

The TS exporter copies `title` and `description` into JSDoc comments on
the produced declaration, so docs round-trip from schema to `.d.ts`.

For type inference inside your TS source, prefer the static `t.infer<T>`
helper (see [Types](/libs/json-type/types)) --- the AST exporter is for
generating *files*.


## Random values

`Random` produces a random value that satisfies a given type. Useful for
property-based tests, demo data, and fuzz harnesses.

```ts
import {t, Random} from '@jsonjoy.com/json-type';

const User = t.Object(
  t.Key('id', t.str),
  t.Key('age', t.Number({format: 'u32', gte: 18, lte: 120})),
);

Random.gen(User);
// {id: '7c9f...', age: 42}
```

The generator respects `min`/`max` on strings, arrays, and bins;
`gt`/`gte`/`lt`/`lte`/`format` on numbers; tuple head/tail; `con` values;
and picks a random branch of `or` types. For `fn`/`fn$` it returns a
stub that produces random outputs.

Pair `Random.gen(type)` with `ValidatorCodegen.get({type})` to test that
your validator agrees with your generator --- the package's own test
suite is built that way.
