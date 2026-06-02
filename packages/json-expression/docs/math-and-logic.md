Operators for numbers, comparisons, booleans, bit twiddling, and control flow.
Every operator that has a symbolic alias lists it; the word form and the symbol
are interchangeable.

## Arithmetic

```ts
['+', 1, 2, 3];                  // => 6
['-', 10, ['$', '/x']];          // 10 - x
['*', ['$', '/price'], 1.2];     // price * 1.2
```

| Operator | Aliases | Arity | Result |
|----------|---------|-------|--------|
| `add` | `+` | variadic | Sum of all operands |
| `subtract` | `-` | variadic | First operand minus the rest |
| `multiply` | `*` | variadic | Product of all operands |
| `divide` | `/` | variadic | First operand divided by the rest |
| `mod` | `%` | variadic | Remainder, folded left to right |
| `min` | - | variadic | Smallest operand |
| `max` | - | variadic | Largest operand |
| `round` | - | 1 | Round to nearest integer |
| `ceil` | - | 1 | Round up |
| `floor` | - | 1 | Round down |
| `trunc` | - | 1 | Drop the fractional part (toward zero) |
| `abs` | - | 1 | Absolute value |
| `sqrt` | - | 1 | Square root |
| `exp` | - | 1 | e raised to the operand |
| `ln` | - | 1 | Natural logarithm |
| `log` | - | 2 | Logarithm of operand 1 in base operand 2 |
| `log10` | - | 1 | Base-10 logarithm |
| `pow` | `**` | 2 | Operand 1 raised to operand 2 |

## Comparison

Equality is **deep** for objects and arrays. The ordering operators compare
numbers and strings.

```ts
['==', ['$', '/status'], 'active'];
['cmp', 2, 1];   // => 1   (-1, 0, or 1)
['between', ['$', '/age'], 18, 65]; // 18 <= age <= 65
```

| Operator | Aliases | Arity | Result |
|----------|---------|-------|--------|
| `eq` | `==` | 2 | Deep equality |
| `ne` | `!=` | 2 | Deep inequality |
| `gt` | `>` | 2 | Greater than |
| `ge` | `>=` | 2 | Greater than or equal |
| `lt` | `<` | 2 | Less than |
| `le` | `<=` | 2 | Less than or equal |
| `cmp` | - | 2 | Three-way compare: `-1`, `0`, or `1` |
| `between` | `=><=` | 3 | `low <= value <= high` |
| `><` | - | 3 | `low < value < high` |
| `=><` | - | 3 | `low <= value < high` |
| `><=` | - | 3 | `low < value <= high` |

The between-family takes the value first, then the bounds:
`['between', value, low, high]`. The operator name encodes which ends are
inclusive (`=`) versus exclusive --- `=><=` is inclusive on both ends.

## Logical

```ts
['and', ['>', ['$', '/age'], 18], ['$', '/verified']];
['or', ['$', '/admin'], ['$', '/owner']];
['not', ['$', '/disabled']];
```

| Operator | Aliases | Arity | Result |
|----------|---------|-------|--------|
| `and` | `&&` | variadic | True when all operands are truthy |
| `or` | `\|\|` | variadic | True when any operand is truthy |
| `not` | `!` | 1 | Logical negation |

## Bitwise

Integer bit operations.

| Operator | Aliases | Arity | Result |
|----------|---------|-------|--------|
| `bitAnd` | `&` | variadic | Bitwise AND |
| `bitOr` | `\|` | variadic | Bitwise OR |
| `bitXor` | `^` | variadic | Bitwise XOR |
| `bitNot` | `~` | 1 | Bitwise NOT |

## Branching

```ts
['?', ['>', ['$', '/n'], 0], 'positive', 'non-positive'];
['throw', 'invalid input'];
```

| Operator | Aliases | Arity | Result |
|----------|---------|-------|--------|
| `if` | `?` | 3 | `condition ? then : otherwise`; only the taken branch is evaluated |
| `throw` | - | 1 | Throws its operand as the error value |

`if` short-circuits: the untaken branch is never evaluated, so it is safe to put
a `throw` or a `$` that might not resolve in either arm.
