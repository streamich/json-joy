## Communication channel

A minimal abstraction for bidirectional communication channels. It wraps
WebSockets, `fetch`, and other transports behind a single `PhysicalChannel`
interface backed by RxJS observables. This is the transport layer beneath
[rpc-calls](/libs/rpc-calls) and [rpc-client](/libs/rpc-client).


## Installation

```
npm install @jsonjoy.com/channel
```


## Components

- **`PhysicalChannel`** — the interface every channel implements: `message$`,
  `error$`, `open$`, `close$`, `state$`, `send()`, `send$()`, `close()`, `buffer()`, `isOpen()`.
- **`WebSocketChannel`** — wraps a native `WebSocket` into a `PhysicalChannel`.
- **`FetchChannel`** — wraps a `fetch`-style request/response into a channel.
- **`Utf8Channel`** — transparently converts binary messages to and from UTF-8.
- **`PersistentChannel`** — auto-reconnecting wrapper with configurable backoff.
