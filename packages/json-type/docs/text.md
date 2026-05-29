## JSON Type

`@jsonjoy.com/json-type` is a JSON type system with a TypeScript builder,
a serializable schema AST, and JIT-compiled validators and codecs.

You describe your data once with `t.*`, and from that single description
you get:

- a TypeScript type via `t.infer<typeof T>`,
- a runtime validator (boolean / string / object errors),
- encoders for JSON text, JSON binary, CBOR, and MessagePack,
- exports to JSON Schema, JSON Type Definition, and TypeScript declarations,
- a random-value generator.

All of the runtime helpers are JIT-compiled per type. Validation and
encoding are typically an order of magnitude faster than interpreter-based
schema libraries on the same input.


## Installation

```
npm install @jsonjoy.com/json-type
```


## Quick start

```ts
import {t, ValidatorCodegen, JsonTextCodegen} from '@jsonjoy.com/json-type';

const User = t.Object(
  t.Key('id', t.str),
  t.Key('name', t.str),
  t.KeyOpt('email', t.str),
  t.Key('age', t.Number({format: 'u32', gte: 0})),
);

type User = t.infer<typeof User>;
// {id: string; name: string; email?: string; age: number}

const validate = ValidatorCodegen.get({type: User, errors: 'boolean'});
const toJson = JsonTextCodegen.get(User);

const user: User = {id: 'u_1', name: 'Alice', age: 30};

validate(user);             // false  (no error)
toJson(user);               // '{"id":"u_1","name":"Alice","age":30}'
```


## Surface

| Area | What's there |
|---|---|
| [Types](/libs/json-type/types) | `t.*` builder, all type kinds, options, `t.infer` |
| [Modules](/libs/json-type/modules) | `ModuleType`, aliases, `Ref`, functions |
| [Validators](/libs/json-type/validators) | `ValidatorCodegen`: JIT validation with three error modes |
| [Codecs](/libs/json-type/codecs) | JSON text/binary, CBOR, MessagePack encoders; capacity estimator |
| [Interop](/libs/json-type/interop) | JSON Schema, JTD, TypeScript export, random values |


## Why a new schema library

JSON Schema and JTD are both standards, but neither is friendly to write
by hand and neither comes with a runtime fast enough to put on the hot
path of an RPC server.

`json-type` keeps the schema as a plain serializable POJO --- so you can
treat it as data, ship it over the wire, persist it --- but it also
attaches a chainable builder, an in-memory class hierarchy, and a codegen
pipeline that compiles each schema into specialized JavaScript on first
use. The result is a single description that powers static types,
validation, serialization, and external-tool interop, with no per-call
overhead.

The package is what the
[Reactive RPC stack](/libs/rpc-server) uses to describe its procedures
end-to-end, but it has no RPC-specific code and works for anything that
needs typed JSON.
