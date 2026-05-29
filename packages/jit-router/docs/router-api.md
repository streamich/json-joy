## Router API

The public surface is small: one class to build the routing table, one
function (the result of `.compile()`) to match against it.

```ts
class Router<Data = unknown> {
  constructor(options?: RouterOptions);

  readonly destinations: Destination[];

  add(route: string | string[], data: Data): void;
  addDestination(destination: Destination): void;

  tree(): RoutingTreeNode;
  compile(): RouteMatcher<Data>;
  toString(tab?: string): string;
}

type RouteMatcher<Data> = (route: string) => Match<Data> | undefined;
```


## `Router(options?)`

```ts
interface RouterOptions {
  defaultUntil?: string;   // default delimiter for {name} steps (default '/')
}

const router = new Router<RouteData>();
const slashless = new Router<RouteData>({defaultUntil: '|'});
```

`Data` is the type associated with each destination --- usually your
handler, metadata object, or simple string tag.


## `add(route, data)`

Registers a route. `route` can be one string or an array of strings (all
mapped to the same `data`).

```ts
router.add('GET /users/{id}', {handler: getUser});
router.add(['GET /ping', 'GET /pong'], 'PING');
```

Calls to `add` after `compile` are valid --- the previously compiled
matcher is unaffected; call `compile` again to rebuild.


## `compile()`

Returns the matcher function. Compilation walks the internal tree once and
emits JavaScript code. The returned function:

- Takes a single string (the route to look up).
- Returns a `Match<Data>` on hit or `undefined` on miss.
- Never throws.
- Never allocates on miss; allocates one `Match` on hit.

```ts
const matcher = router.compile();
const m = matcher('GET /users/42');
m?.data;     // RouteData
m?.params;   // string[]
```

Calling `toString()` on the matcher prints the generated source --- handy
for debugging:

```ts
console.log(matcher.toString());
```


## `Match`

```ts
class Match<Data> {
  constructor(public readonly data: Data, public params: string[] | null);
}
```

`params` is an array of the captured parameter values, in the order they
appear in the matched route. Anonymous params (`{:pattern}`) are not
included.


## `Destination` and `Route`

These exist mostly as internal types but are useful when introspecting:

```ts
class Destination {
  readonly routes: Route[];
  readonly data: unknown;
  readonly match: Match;
}

class Route {
  readonly steps: Step[];   // ExactStep | UntilStep | RegexStep
  toText(): string;
}
```

You can pre-build destinations and add them directly:

```ts
import {Destination} from '@jsonjoy.com/jit-router';

const dest = Destination.from(['GET /a', 'GET /b'], {handler: doAOrB});
router.addDestination(dest);
```


## Step classes

| Class | Fields |
|---|---|
| `ExactStep` | `text: string` |
| `UntilStep` | `name: string`, `until: string` (one char or `\n`) |
| `RegexStep` | `name: string`, `regex: string`, `until: string` |

`step.toText()` round-trips back to the source syntax (useful for
introspection / logging).


## Introspection

```ts
// All registered destinations
router.destinations.length;
router.destinations.forEach((d) => console.log(d.routes.map((r) => r.toText())));

// The hybrid Trie/Radix routing tree
console.log(router.tree().toString('  '));

// Whole router state
console.log(router.toString());
```

`tree()` returns a fresh `RoutingTreeNode` each call --- it's the internal
structure that `compile()` walks. You don't need to interact with it
directly to use the router; it's exposed for diagnostics.


## Typed routes

`Router<Data>` parameterizes the destination payload, so the matcher's
return type is inferred:

```ts
interface RouteData {
  handler: string;
  cache?: boolean;
}

const router = new Router<RouteData>();
router.add('GET /users/{id}', {handler: 'getUser', cache: true});

const m = router.compile()('GET /users/42');
if (m) {
  m.data.handler;   // string
  m.data.cache;     // boolean | undefined
  m.params;         // string[] | null
}
```


## Miss behavior

The matcher returns `undefined` for any input it doesn't recognize ---
unknown methods, malformed routes, empty strings. No exceptions, no
defaults; check for `undefined` and decide your fallback at the call site.

```ts
matcher('GET /unknown');   // undefined
matcher('');               // undefined
matcher('INVALID');        // undefined
```
