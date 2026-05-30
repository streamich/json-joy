Operators for inspecting and casting values, measuring and indexing containers,
working with strings, and reading numbers out of binary buffers.

## Type inspection and casts

`type` returns one of `boolean`, `null`, `number`, `string`, `object`, `array`,
`undefined`, or `binary`. The cast operators coerce a value to a target type.

```ts
['type', ['$', '/x']];   // e.g. 'number'
['num', ['$', '/count']]; // coerce to number
['str', 123];             // => '123'
```

| Operator | Arity | Result |
|----------|-------|--------|
| `type` | 1 | Runtime type name (see list above) |
| `bool` | 1 | Coerce to boolean |
| `num` | 1 | Coerce to number |
| `str` | 1 | Coerce to string |

## Type guards

Each guard returns a boolean. Note the trailing `?` is part of the operator
name.

| Operator | True when the value is |
|----------|------------------------|
| `und?` | `undefined` |
| `nil?` | `null` |
| `bool?` | a boolean |
| `num?` | a number |
| `str?` | a string |
| `bin?` | binary (`Uint8Array`) |
| `arr?` | an array |
| `obj?` | an object |

```ts
['?', ['str?', ['$', '/id']], ['$', '/id'], ['str', ['$', '/id']]];
```

## Containers: length and member access

`len` measures strings, arrays, objects (key count), and binary; it returns `0`
for scalars. `member` (alias `[]`) reads an element by index or key.

```ts
['len', ['$', '/items']];        // number of items
['member', ['$', '/items'], 0];  // first item
['[]', ['$', '/user'], 'name'];  // user.name
```

| Operator | Aliases | Arity | Result |
|----------|---------|-------|--------|
| `len` | | 1 | Length / size of a string, array, object, or binary |
| `member` | `[]` | 2 | Element of an array/object/string/binary by index or key |

## Strings

```ts
['.', 'Hello, ', ['$', '/name']];   // concatenation
['starts', ['$', '/type'], 'com.']; // prefix test
['substr', 'abcde', 1, 3];          // => 'bc'
```

| Operator | Aliases | Arity | Result |
|----------|---------|-------|--------|
| `cat` | `.` | variadic | Concatenate operands into a string |
| `contains` | | 2 | Whether operand 1 contains operand 2 |
| `starts` | | 2 | Whether operand 1 starts with operand 2 |
| `ends` | | 2 | Whether operand 1 ends with operand 2 |
| `substr` | | 3 | Substring `(string, start, end)` |
| `matches` | | 2 | Whether the string matches a pattern --- requires `createPattern` |

`matches` needs a pattern compiler supplied through the `createPattern` option;
see [Evaluate and compile](/libs/json-expression/evaluate-and-compile).

### String validators

Boolean operators that test common string formats:

| Operator | Validates |
|----------|-----------|
| `email?` | Email address |
| `hostname?` | Hostname |
| `ip4?` | IPv4 address |
| `ip6?` | IPv6 address |
| `uuid?` | UUID |
| `uri?` | URI |
| `duration?` | ISO 8601 duration |
| `date?` | Full date |
| `time?` | Time |
| `dateTime?` | Date-time |

```ts
['?', ['email?', ['$', '/contact']], 'ok', 'bad email'];
```

## Binary reads

When the input is a `Uint8Array`, these operators read a typed number at a byte
offset: `[op, binary, offset]`.

| Operator | Reads |
|----------|-------|
| `u8` / `i8` | Unsigned / signed 8-bit integer |
| `u16` / `i16` | Unsigned / signed 16-bit integer |
| `u32` / `i32` | Unsigned / signed 32-bit integer |
| `f32` / `f64` | 32- / 64-bit float |

```ts
['u8', ['$', '/buf'], 0]; // first byte of the buffer as an unsigned int
```
