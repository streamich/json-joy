# `@jsonjoy.com/channel`

Minimal abstraction for bidirectional communication channels. Wraps
WebSockets, `fetch`, and other transports behind a single `PhysicalChannel`
interface backed by RxJS observables.

## Components

**`PhysicalChannel`** — interface that every channel implements: `message$`,
`error$`, `open$`, `close$`, `state$`, `send()`, `send$()`, `close()`, `buffer()`, and `isOpen()`.

**`WebSocketChannel`** — wraps a native `WebSocket` (or compatible object) into
a `PhysicalChannel`. Handles open/close/error/message lifecycle automatically.

**`FetchChannel`** — wraps a `fetch`-style request/response function into a
`PhysicalChannel`. Each `send()` call triggers a fetch and emits the response as
an incoming message.

**`Utf8Channel`** — decorator that transparently converts binary messages to
and from UTF-8 strings on any underlying `PhysicalChannel`.

**`PersistentChannel`** — auto-reconnecting wrapper around any `PhysicalChannel`
factory. Configurable backoff, retry logic, and minimum-uptime tracking.
