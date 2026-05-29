## Serialization

`RpcError.toJson()` produces a plain object matching the `IRpcError`
interface. The full RPC stack ([`rpc-codec`](/libs/rpc-codec),
[`rpc-server`](/libs/rpc-server), [`rpc-calls`](/libs/rpc-calls))
calls `toJson()` when transmitting an error and reconstructs an `RpcError`
on the receiver.

```ts
RpcError.notFound('User not found').toJson();
// { message: 'User not found', code: 'NOT_FOUND', errno: 3 }

RpcError.validation('Bad email', {field: 'email'}).toJson();
// { message: 'Bad email', code: 'BAD_REQUEST', errno: 1, meta: {field: 'email'} }
```

Fields with no value are omitted, keeping the wire format compact.


## On the receiving end

```ts
try {
  await client.call('users.get', {id});
} catch (err) {
  if (RpcError.isRpcError(err)) {
    if (err.code === 'NOT_FOUND') return null;
    if (err.errno === RpcErrorCodes.THROTTLE) await wait(1000);
  }
  throw err;
}
```

`RpcError.isRpcError(value)` is a structural check (it does **not** require
`instanceof RpcError`), so it works after the error has been serialized,
sent over the wire, and rehydrated by a different instance of the package.


## What is *not* serialized

`originalError` is intentionally omitted from `toJson()` --- it usually
holds a server-side stack trace, internal types, or a cause chain that
shouldn't leak to clients. Use it locally for logging:

```ts
try {
  await doSomething();
} catch (cause) {
  const wrapped = RpcError.from(cause);
  logger.error('OP_FAILED', cause, {code: wrapped.code});
  throw wrapped;
}
```


## `RpcLogger`

The package also exports the logger interface used by `rpc-server` and
related dispatchers:

```ts
interface RpcLogger {
  log(msg: unknown): void;
  error(kind: string, error?: Error | unknown | null, meta?: unknown): void;
}
```

`console` satisfies it, which is why most servers default to it.
