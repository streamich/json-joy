## Connection context

Every request handler --- HTTP or WebSocket, on either backend --- receives a
`ConnectionContext` describing the incoming connection. Your callee methods
receive the same object as their second argument.

```ts
interface ConnectionContext<Meta = Record<string, unknown>> {
  path: string;
  query: string;
  ip: string;
  token: string;
  params: string[] | null;
  meta: Meta;
  reqCodec: JsonValueCodec;
  resCodec: JsonValueCodec;
  msgCodec: RpcMessageCodec;
}
```

| Field | Description |
|---|---|
| `path` | Request URL path (no query string) |
| `query` | Raw query string (without the leading `?`) |
| `ip` | Resolved client IP (see below) |
| `token` | Extracted authentication token (see below) |
| `params` | Captured route parameters from the path pattern |
| `meta` | Per-request scratch space; populated by `augmentContext` or your own middleware |
| `reqCodec` | Value codec used to decode the request body |
| `resCodec` | Value codec used to encode the response body |
| `msgCodec` | RPC message codec (Compact, Binary, or JSON-RPC 2.0) |


## Client IP

`Http1Server.findIp(req)` and `RpcApp` both check, in order:

1. `X-Forwarded-For` header (first value if comma-separated)
2. `X-Real-IP` header
3. The remote socket address


## Token extraction

The token is searched for using the pattern `tkn.<token>` in (in order):

1. `Authorization` header
2. URL (query string)
3. `Cookie` header
4. `Sec-WebSocket-Protocol` header (WebSocket upgrade)

Clients send tokens by embedding them in any of those locations, e.g.
`Authorization: Bearer tkn.abc123` or `?tkn.abc123`.


## Codec negotiation

The `Content-Type` header (or `Sec-WebSocket-Protocol` on WS upgrade) is
parsed using the pattern:

```
rpc.<protocol>.<message-format>.<value-codec>[-<response-codec>]
```

| Slot | Values |
|---|---|
| `protocol` | `rx` (Reactive), `json2` (JSON-RPC 2.0) |
| `message-format` | `compact`, `binary` (Rx only) |
| `value-codec` | `json`, `cbor`, `msgpack` |
| `response-codec` | optional override for the response only |

Examples:

```
Content-Type: rpc.rx.compact.json
Content-Type: rpc.rx.compact.cbor-json
Content-Type: rpc.json2.verbose.json
```

The matching `reqCodec`, `resCodec`, and `msgCodec` are set on the context
before the handler runs --- you usually never touch them directly.


## Adding per-request data

Use `RpcApp`'s `augmentContext` option (uWS backend) or wrap handlers
manually (HTTP backend) to populate `ctx.meta`:

```ts
const app = new RpcApp({
  uws: App({}),
  callee: myCallee,
  augmentContext: (ctx) => {
    ctx.meta.requestId = crypto.randomUUID();
  },
});
```

Then callee methods can read `ctx.meta.requestId` for logging or correlation.
