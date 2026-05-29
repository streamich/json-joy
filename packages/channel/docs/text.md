## Channel

`@jsonjoy.com/channel` is a thin abstraction for bidirectional byte streams.
Every concrete transport --- WebSocket, `fetch`, in-memory test pipe ---
implements the same `PhysicalChannel` interface, exposing incoming messages
and lifecycle events as RxJS observables.

This is the transport layer underneath the Reactive RPC stack
([`rpc-calls`](/libs/rpc-calls), [`rpc-client`](/libs/rpc-client)) but is
useful on its own when you just need a uniform shape over WebSocket plus
auto-reconnect.


## Installation

```
npm install @jsonjoy.com/channel rxjs
```

`rxjs@7` is a peer dependency.


## Surface

| Area | Surface |
|---|---|
| [PhysicalChannel](/libs/channel/physical-channel) | The interface and lifecycle |
| [Transports](/libs/channel/transports) | `WebSocketChannel`, `FetchPhysicalChannel`, `Utf8Channel` |
| [Persistent channel](/libs/channel/persistent-channel) | Auto-reconnect with configurable backoff |


## Quick start

```ts
import {WebSocketChannel} from '@jsonjoy.com/channel';

const channel = new WebSocketChannel<Uint8Array>({
  newSocket: () => new WebSocket('wss://example.com/rx'),
});

channel.open$.subscribe(() => channel.send(new Uint8Array([1, 2, 3])));
channel.message$.subscribe((data) => console.log('recv', data));
channel.close$.subscribe(([, evt]) => console.log('closed', evt.code));
```

For auto-reconnect, wrap it in [`PersistentPhysicalChannel`](/libs/channel/persistent-channel):

```ts
import {PersistentPhysicalChannel} from '@jsonjoy.com/channel';

const persistent = new PersistentPhysicalChannel<Uint8Array>({
  newChannel: () => new WebSocketChannel({newSocket: () => new WebSocket(url)}),
});

persistent.start();
persistent.message$.subscribe((data) => handle(data));
```
