## Modules

A `ModuleType` is a named registry of types. It owns:

- a `TypeBuilder` (`.t`) whose types remember which module they belong to,
- a map of `alias id` to `AliasType` (the declarations), and
- a `resolve()` that follows `ref` chains.

Modules are what you reach for once you need named, mutually referencing
types --- e.g. when building an RPC service or a JSON document schema with
shared definitions.

```ts
import {ModuleType} from '@jsonjoy.com/json-type';

const system = new ModuleType();
const {t} = system;

const User = t.Object(
  t.Key('id', t.str),
  t.Key('name', t.str),
).alias('User');

const Post = t.Object(
  t.Key('id', t.str),
  t.Key('author', t.Ref('User')),
  t.Key('body', t.str),
).alias('Post');
```

`.alias('Name')` is equivalent to `system.alias('Name', type)`. Either
form registers the alias and returns an `AliasType`. Calling `.alias()`
again with the same name returns the existing entry --- aliases are
deduplicated.


## Aliases and refs

`t.Ref('id')` is a *forward declaration*: a typed placeholder for an alias
defined elsewhere in the same module. Refs resolve lazily, so you can
reference an alias before you've declared it.

```ts
const A = t.Object(
  t.Key('child', t.Ref('B')),
).alias('A');

const B = t.Object(
  t.Key('child', t.Ref('A')),     // cycles are fine
).alias('B');

system.resolve('A');              // AliasType<'A', ObjType<...>>
system.unalias('A');              // same, throws if missing
system.hasAlias('A');             // boolean
```

`resolve()` walks through `ref -> ref` chains until it lands on a concrete
type. `unalias()` is a single, non-chasing lookup.


## Importing a serialized schema

`t.import(schema)` lifts a schema POJO into a chainable type. Module-level
imports go through `module.import(moduleSchema)` or `importTypes`:

```ts
const system = new ModuleType();

const aliases = system.importTypes({
  Coord: s.Object({
    keys: [s.Key('x', s.num), s.Key('y', s.num)],
  }),
  Line: s.Object({
    keys: [
      s.Key('from', s.Ref('Coord')),
      s.Key('to', s.Ref('Coord')),
    ],
  }),
});

aliases.Line;                    // AliasType<'Line', ObjType<...>>
```

Object schemas may declare `extends: ['ParentAlias']`. `module.import`
walks the module once and flattens those into a single `keys` list before
constructing the types.


## Functions in a module

`fn` and `fn$` are types like any other --- alias them and they become
"procedures" of the module:

```ts
const Ping = t.Function(t.undef, t.str)
  .default(() => 'pong')
  .alias('ping');

const Echo = t.Function(t.str, t.str)
  .default(async (msg) => msg)
  .description('Echo a string back.')
  .alias('echo');

const Tick = t.Function$(t.undef, t.num)
  .default(() => interval(1000))
  .alias('tick');
```

Each procedure carries its request and response types, an optional default
implementation (used by RPC servers as a "first-party handler"), and the
usual `title`/`description`/`example` metadata.

`t.Function(req, res).ctx<{userId: string}>()` declares a context shape;
the implementation `(req, ctx) => res` then sees that context.


## Inspecting and exporting

```ts
system.aliases;                  // Map<string, AliasType>
system.exportTypes();            // {[id]: Schema} POJO
console.log(system + '');        // pretty-printed tree
```

`exportTypes()` returns the raw schema for each alias, suitable for
serializing the module and sending it over the wire. To import it on the
other side: `new ModuleType().import({kind: 'module', keys: [...]})`.


## Why a module and not just types?

Refs need a resolver. Three reasons aliases live on a module:

- They give you stable IDs to put in `Ref('...')` --- without that, every
  reference would have to embed the whole type.
- The same alias used in many places stays one node, so generated
  validators and encoders can share helper functions.
- RPC servers can list a module's procedures (`Function`/`Function$` aliases)
  as their public API.

If you don't need refs, you don't need a module --- the top-level `t`
builder works without one.
