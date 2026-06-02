Operators that build and transform arrays and objects, plus a JSON Patch `add`
for non-destructive updates. The higher-order array operators (`filter`, `map`,
`reduce`) run a sub-expression per element, binding a named variable you read
with `$`.

Remember to box literal arrays: `[[1, 2, 3]]` is the array `[1, 2, 3]`, while a
bare `[1, 2, 3]` is read as a call to the operator named `1`.

## Array operators

```ts
['concat', ['$', '/a'], ['$', '/b']]; // a ++ b
['head', ['$', '/items'], 3];         // first 3 items
['in', [['a', 'b', 'c']], ['$', '/x']]; // is x one of a/b/c?
```

| Operator | Aliases | Arity | Result |
|----------|---------|-------|--------|
| `concat` | `++` | variadic | Concatenate arrays into one |
| `push` | | variadic | `(array, ...items)` --- array with items appended (non-mutating) |
| `head` | | 2 | `(array, n)` --- first `n` items; negative `n` takes from the end |
| `slice` | | 3 | `(array, start, end)` --- sub-array |
| `sort` | | 1 | Sorted copy |
| `reverse` | | 1 | Reversed copy |
| `in` | | 2 | `(array, value)` --- whether `value` is in `array` (deep equality) |
| `indexOf` | | 2 | `(array, value)` --- index of `value`, or `-1` |
| `zip` | | 2 | Pair up two arrays into `[a, b]` tuples |
| `fromEntries` | | 1 | Build an object from `[key, value]` pairs |
| `filter` | | 3 | Keep elements matching a predicate (see below) |
| `map` | | 3 | Transform each element (see below) |
| `reduce` | | 5 | Fold to a single value (see below) |

### `filter` and `map`

Both take `[op, array, varname, expression]`. `varname` is a constant string
naming the per-element variable; `expression` runs once per element and reads
the element via `['$', varname]`.

```ts
// Keep even numbers.
['filter', [[1, 2, 3, 4, 5]], 'x', ['not', ['%', ['$', 'x'], 2]]]; // => [2, 4]

// Triple each number.
['map', [[1, 2, 3]], 'x', ['*', ['$', 'x'], 3]]; // => [3, 6, 9]
```

The element variable coexists with the input, so `map`/`filter` bodies can still
read the outer data:

```ts
['map', ['$', '/arr'], 'x', ['*', ['$', 'x'], ['$', '/multiple']]];
```

### `reduce`

`reduce` takes `[reduce, array, initial, accName, varName, expression]`. The
expression reads the accumulator via `['$', accName]` and the current element
via `['$', varName]`, and returns the next accumulator.

```ts
['reduce', [[1, 2, 3, 4, 5]], 0, 'acc', 'x', ['+', ['$', 'acc'], ['$', 'x']]]; // => 15
```

## Object operators

```ts
['keys', ['$', '/user']];                // property names
['o.set', ['$', '/user'], 'active', true]; // user with active: true
['o.del', ['$', '/user'], 'password'];     // user without password
```

| Operator | Arity | Result |
|----------|-------|--------|
| `keys` | 1 | Array of the object's keys |
| `values` | 1 | Array of the object's values |
| `entries` | 1 | Array of `[key, value]` pairs |
| `o.set` | variadic | `(object, key, value, ...)` --- object with the keys set (non-mutating) |
| `o.del` | variadic | `(object, key, ...)` --- object with the keys removed |

`o.set` takes alternating key/value operands and refuses `__proto__`:

```ts
['o.set', {}, 'foo', 'bar', 'baz', ['+', ['$', ''], 3]];
// with input 2 => {foo: 'bar', baz: 5}
```

## JSON Patch: `jp.add`

`jp.add` applies one or more JSON Patch *add* operations, addressing locations
by JSON Pointer. Operands alternate pointer and value; the original input is not
mutated.

```ts
['jp.add', {}, '/foo', 'bar', '/baz', ['+', ['$', ''], 3]];
// with input 2 => {foo: 'bar', baz: 5}
```

| Operator | Arity | Result |
|----------|-------|--------|
| `jp.add` | variadic | `(document, pointer, value, ...)` --- document with values added at each pointer |

Pointers must be constant strings. Adding at an array index inserts at that
position; adding at the array's length appends, and an out-of-range index
throws.
