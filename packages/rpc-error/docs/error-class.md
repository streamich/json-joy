## Error class

`RpcError` extends `Error` and implements the `IRpcError` interface:

```ts
interface IRpcError {
  message: string;
  code?:    string;   // short stable name, e.g. "NOT_FOUND"
  errno?:   number;   // matching numeric code, e.g. 3
  errorId?: string;   // unique ID for log lookup
  meta?:    unknown;  // arbitrary payload
}
```

The instance also exposes `originalError: unknown` --- the value (often
another `Error`) that caused this one, preserved for logging but not
serialized.


## Creating errors

Prefer the named factories: they pick a sensible `code`, `errno`, and
default `message` for you, and produce identical instances regardless of
where in the codebase they originate.

| Factory | Code | Errno | Default message |
|---|---|---|---|
| `RpcError.internal(cause?, msg?)` | `INTERNAL_ERROR` | 0 | `Internal Server Error` |
| `RpcError.badRequest(msg?, meta?, cause?)` | `BAD_REQUEST` | 1 | `Bad Request` |
| `RpcError.notFound(msg?, meta?, cause?)` | `NOT_FOUND` | 3 | `Not Found` |
| `RpcError.conflict(msg?, meta?, cause?)` | `CONFLICT` | 4 | --- |
| `RpcError.validation(msg?, meta?, cause?)` | `BAD_REQUEST` | 1 | --- |
| `RpcError.codec(msg?, meta?, cause?)` | `CODEC` | 415 | `Unsupported Media Type` |

For codes not covered by a factory, use the lookup helpers:

```ts
RpcError.fromCode('OVERFLOW', 'Queue full');
RpcError.fromErrno(RpcErrorCodes.THROTTLE, 'Slow down');
RpcError.create('MY_CUSTOM', 'Something specific', 42, {item: 'x'}, cause);
```

`RpcError.from(value)` is the universal wrapper: it returns `value` as-is if
it's already an `RpcError`, otherwise wraps it as `INTERNAL_ERROR` with the
original attached.

```ts
try {
  await doSomething();
} catch (cause) {
  throw RpcError.from(cause);
}
```


## Built-in codes

The `RpcErrorCodes` enum maps every named code to its `errno`:

| Code | Errno | Meaning |
|---|---|---|
| `INTERNAL_ERROR` | 0 | Unknown server error (HTTP 500) |
| `BAD_REQUEST` | 1 | Invalid request (HTTP 400) |
| `TIMEOUT` | 2 | No activity on stream long enough to time out |
| `NOT_FOUND` | 3 | Resource not found (HTTP 404) |
| `CONFLICT` | 4 | Operation conflicts with existing state (HTTP 409) |
| `METHOD_UNK` | 5 | Unknown RPC method |
| `METHOD_INV` | 6 | Invalid RPC method shape |
| `STOP` | 7 | Server stopping in-flight call |
| `DISCONNECT` | 8 | Connection lost |
| `OVERFLOW` | 9 | Buffer overflow |
| `THROTTLE` | 10 | Rate limited |
| `AUTH` | 11 | Authentication failure |
| `AUTHC` | 12 | Authentication challenge |
| `AUTHZ` | 13 | Authorization failure |
| `CODEC` | 415 | Unsupported media type |


## Why both `code` and `errno`

Code strings are stable, self-documenting, and survive JSON round-trips
without ambiguity. Numeric `errno` values are compact and cheap to dispatch
on in hot paths. Both ship in every serialized error, so consumers can
choose.


## Which factory to use

| Situation | Use |
|---|---|
| Validation failure on the request | `RpcError.validation(msg, errors)` |
| Resource missing | `RpcError.notFound(msg)` |
| Operation conflicts with existing state | `RpcError.conflict(msg)` |
| Unsupported `Content-Type` | `RpcError.codec()` |
| Catching an unknown exception | `RpcError.from(err)` |
| Anything else with a known code | `RpcError.fromCode('CODE')` |
| Custom code not in the enum | `RpcError.create('MY_CODE', ...)` |
