## RPC messages

`@jsonjoy.com/rpc-messages` is the TypeScript representation of the nine
message types defined by the [JSON Reactive RPC](/specs/json-rx)
specification --- one class per message, plus discriminated-union types
and a `toMessage(...)` parser for the compact tuple form. See the spec
for message semantics and the wire format; this package is only the
in-memory shape.


## Installation

```
npm install @jsonjoy.com/rpc-messages
```


## Exports

| Symbol | Notes |
|---|---|
| `NotificationMessage` | Fire-and-forget, either direction |
| `RequestDataMessage`, `RequestCompleteMessage`, `RequestErrorMessage`, `ResponseUnsubscribeMessage` | Client to server |
| `ResponseDataMessage`, `ResponseCompleteMessage`, `ResponseErrorMessage`, `RequestUnsubscribeMessage` | Server to client |
| `RxClientMessage`, `RxServerMessage`, `RxMessage` | Discriminated-union types |
| `toMessage(tuple)` | Parse a compact-form tuple back to a class instance |
| `validateId`, `validateMethod` | Field validators used by message `validate()` |

Every message carries a typed payload as `value: Value | undefined` (from
[`@jsonjoy.com/json-type`](https://github.com/streamich/json-joy/tree/master/packages/json-type)),
implements `validate()`, and serializes via `toCompact()`.


## Example

```ts
import {RequestCompleteMessage, toMessage} from '@jsonjoy.com/rpc-messages';

const msg = new RequestCompleteMessage(1, 'util.ping', undefined);
msg.toCompact();                // [1, 1, 'util.ping']
toMessage([1, 1, 'util.ping']); // RequestCompleteMessage { id: 1, ... }
```


## See also

- [JSON Reactive RPC specification](/specs/json-rx) --- message semantics
  and wire format.
- [`rpc-codec`](/libs/rpc-codec) --- encodes these messages to bytes.
- [`rpc-calls`](/libs/rpc-calls) --- consumes these messages to dispatch
  procedures.
