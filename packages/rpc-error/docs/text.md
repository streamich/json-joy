## RPC error

`@jsonjoy.com/rpc-error` is a single class --- `RpcError` --- used by every
package in the Reactive JSON-RPC stack to signal failures. It carries a
human-readable message, a stable string `code`, a numeric `errno`, and
optional metadata, and serializes to a JSON shape that round-trips across
the wire.

There are no dependencies. The package also exports a small `RpcLogger`
interface used by `rpc-server` and friends.


## Installation

```
npm install @jsonjoy.com/rpc-error
```


## Surface

| Area | Surface |
|---|---|
| [Error class](/libs/rpc-error/error-class) | `RpcError`, factory methods, built-in codes |
| [Serialization](/libs/rpc-error/serialization) | `toJson()`, wire format, recognising errors |


## Quick start

```ts
import {RpcError} from '@jsonjoy.com/rpc-error';

if (!user) throw RpcError.notFound('User not found');
if (existing) throw RpcError.conflict('Email already registered');

try {
  await doSomething();
} catch (cause) {
  // Wraps anything; preserves the original via .originalError
  throw RpcError.from(cause);
}
```

On the wire, every error becomes a small JSON object:

```json
{"message": "User not found", "code": "NOT_FOUND", "errno": 3}
```

Recipients can rehydrate it by checking `RpcError.isRpcError(...)` and
reading `code` / `errno` --- see [Serialization](/libs/rpc-error/serialization).
