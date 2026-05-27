## Reactive RPC calls

Implements [Reactive RPC](/specs/json-rx) procedure-calling semantics, abstracted
away from any transport or serialization format. Built on top of
[rpc-messages](/libs/rpc-messages) and [rpc-error](/libs/rpc-error).


## Concepts

- **`PhysicalChannel`** (from [channel](/libs/channel)) — a low-level transport
  (WebSocket, HTTP, ...), a duplex stream of raw `string`/`Uint8Array` messages.
- **`LogicalChannel`** — adds message framing, encoding, and decoding over a
  `PhysicalChannel`, turning raw messages into structured RPC messages.
- **`Procedure`** — the specification of a single remote function.
- **`Callee`** — a collection of procedures, on the server side.
- **`Caller`** — a client that invokes remote procedures.
- **`Dispatcher`** — connects a `LogicalChannel` to a `Callee`, routing requests
  to procedures and returning responses.

```
Caller -> LogicalChannel -> PhysicalChannel <- LogicalChannel <- Dispatcher -> Callee -> Procedure
```
