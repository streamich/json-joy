## Reactive RPC messages

Message types for the [JSON Reactive RPC](/specs/json-rx) (JSON Rx) protocol, a
lightweight bi-directional RPC protocol with reactive (Observable) request and
response payloads. It supports notifications, request/response, and full
bidirectional streaming over any message-passing transport (WebSocket, HTTP, IPC).


## Installation

```
npm install @jsonjoy.com/rpc-messages
```


## Messages

JSON Rx defines nine message types split between client-sent and server-sent
messages, e.g. `NotificationMessage`, `RequestDataMessage`,
`RequestCompleteMessage`, `RequestErrorMessage`, `ResponseDataMessage`,
`ResponseCompleteMessage`, `ResponseErrorMessage`, and the un-subscribe messages.

```ts
import {NotificationMessage, RequestDataMessage, ResponseCompleteMessage} from '@jsonjoy.com/rpc-messages';
```
