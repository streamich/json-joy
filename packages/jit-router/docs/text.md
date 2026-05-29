## JIT Router

`@jsonjoy.com/jit-router` is a high-performance HTTP path router. Routes
are stored in a hybrid Trie + Radix tree, then JIT-compiled into a single
optimized JavaScript function for each `Router` instance. The compiled
function uses branchless string comparisons, early returns, and zero
allocations on a hit --- typically 4--10x faster than the next-fastest
router on identical workloads.

It is what [`rpc-server`](/libs/rpc-server) uses internally for HTTP and
WebSocket route matching, but it's a standalone package and works for any
string-keyed routing task (HTTP, RPC, command dispatch).


## Installation

```
npm install @jsonjoy.com/jit-router
```

Zero runtime dependencies (`sonic-forest` is the only internal helper).


## Quick start

```ts
import {Router} from '@jsonjoy.com/jit-router';

const router = new Router();
router.add('GET /users', {handler: 'listUsers'});
router.add('GET /users/{id}', {handler: 'getUser'});
router.add('POST /users/{id}/posts', {handler: 'createPost'});

const match = router.compile();

const result = match('GET /users/42');
result?.data;     // {handler: 'getUser'}
result?.params;   // ['42']
```


## Surface

| Area | Surface |
|---|---|
| [Route patterns](/libs/jit-router/route-patterns) | Exact, parameter, and regex steps |
| [Router API](/libs/jit-router/router-api) | `Router`, `Destination`, `Route`, `Match` |
| [Compilation](/libs/jit-router/compilation) | How JIT codegen works and what it produces |


## Why a router for an RPC stack

HTTP and WebSocket servers --- including everything in the
[`@jsonjoy.com/rpc-server`](/libs/rpc-server) family --- route on the
incoming `<METHOD> <PATH>` string. JIT routing makes this a
single-digit-nanosecond operation, so the cost of dispatch is essentially
free relative to message decoding and procedure execution.

Although born as an internal tool, the router has no rpc-specific code and
can be used on its own.
