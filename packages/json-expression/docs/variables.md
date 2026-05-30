Expressions read their input through **variables**. The input you pass at
evaluation time is the *default variable*; named variables are bound by
scoping operators like `filter`, `map`, and `reduce`, or set manually on the
`Vars` container.

## The `$` / `get` operator

`['$', varname]` (alias `['get', varname]`) reads a value. The `varname` is a
string combining an optional variable name with a JSON Pointer:

```ts
['$', '']           // the whole input (default variable)
['$', '/foo']       // input.foo
['$', '/foo/1']     // input.foo[1]
['$', 'item']       // the named variable `item`
['$', 'item/name']  // named variable `item`, then /name inside it
```

A leading `/` (or an empty string) targets the default variable; otherwise the
text up to the first `/` is the variable name.

```ts
import {evaluate, Vars} from '@jsonjoy.com/json-expression';

evaluate(['$', '/foo'], {vars: new Vars({foo: 2})}); // => 2
evaluate(['$', ''], {vars: new Vars({foo: 2})});     // => {foo: 2}
```

### Default values

By default, reading a missing path **throws** `NOT_FOUND`. Pass a third operand
to return a fallback instead:

```ts
evaluate(['$', '/foo/5'], {vars: new Vars({foo: [1, 2]})});         // throws NOT_FOUND
evaluate(['$', '/foo/5', 'miss'], {vars: new Vars({foo: [1, 2]})}); // => 'miss'
```

### Checking existence with `$?`

`['$?', varname]` (alias `['get?', varname]`) returns a boolean instead of the
value --- `true` when the path resolves, `false` when it does not. Use it to
branch without risking a throw:

```ts
['?', ['$?', '/email'], ['$', '/email'], 'no email'];
```

### Dynamic paths

The `varname` operand can itself be an expression, so the path can be computed
at runtime:

```ts
// Read the pointer to follow out of the data itself.
evaluate(['$', ['$', '/foo/0']], {vars: new Vars({foo: ['/foo']})}); // => ['/foo']
```

~~~jj.note
`$` / `get` is an *impure* operator (its result depends on input), so the
compiler never folds it to a constant --- unlike pure operators over literal
operands. See [Evaluate and compile](/libs/json-expression/evaluate-and-compile).
~~~

## The `Vars` container

Both `evaluate` and a compiled function receive a `Vars` instance, not the raw
data. `Vars` wraps the default-variable value (`env`) and holds named
variables:

```ts
import {Vars} from '@jsonjoy.com/json-expression';

const vars = new Vars({foo: 2});
vars.get('');         // => {foo: 2}   (the env / default variable)
vars.set('x', 42);
vars.get('x');        // => 42
vars.has('x');        // => true
vars.find('', '/foo'); // => 2         (env, then JSON Pointer /foo)
```

| Method | Purpose |
|--------|---------|
| `get(name)` | Named variable, or the env when `name` is `''` |
| `set(name, value)` | Bind a named variable |
| `has(name)` | Whether a named variable is bound |
| `del(name)` | Remove a named variable |
| `find(name, pointer)` | Resolve a JSON Pointer inside a variable |

You rarely call `set` yourself --- the scoping operators bind per-element
variables for you. See `filter`, `map`, and `reduce` in
[Collections](/libs/json-expression/collections).
