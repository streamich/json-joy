## Transports

Three concrete implementations ship with the package:

| Class | Wraps | When to use |
|---|---|---|
| `WebSocketChannel` | Browser/Node `WebSocket` | Bidirectional, persistent stream |
| `FetchPhysicalChannel` | `fetch`-style RPC call | Request/response over HTTP |
| `Utf8Channel` | Another channel | Force text payloads on a binary transport |


## `WebSocketChannel`

Wraps any `WebSocket`-shaped object. The constructor takes a `newSocket`
factory so the channel can recreate the socket on reconnect (when used with
[`PersistentPhysicalChannel`](/libs/channel/persistent-channel)).

```ts
import {WebSocketChannel} from '@jsonjoy.com/channel';

const channel = new WebSocketChannel<Uint8Array>({
  newSocket: () => new WebSocket('wss://example.com/rx', ['rpc.rx.binary.cbor']),
});
```

The `binaryType` is automatically set to `'arraybuffer'`, so incoming binary
messages arrive as `Uint8Array`. Text frames arrive as `string` with the
`isUtf8` flag on `onmessage` set to `true`.

`buffer()` returns the WebSocket's native `bufferedAmount`. `close(code,
reason)` forwards directly to `ws.close(...)`.


## `FetchPhysicalChannel`

Adapts a request/response function into the channel interface. Every
`send()` triggers one `fetch`, and the response is emitted as a single
incoming message.

```ts
import {FetchPhysicalChannel} from '@jsonjoy.com/channel';

const channel = new FetchPhysicalChannel({
  fetch: async (data) => {
    const res = await fetch('https://example.com/rpc', {
      method: 'POST',
      body: data,
    });
    return new Uint8Array(await res.arrayBuffer());
  },
});
```

Because there is no persistent stream, the channel reports
`state$ === OPEN` immediately. `buffer()` always returns `0`. Errors from
`fetch` are pushed to `error$`.


## `Utf8Channel`

A decorator. Wraps any underlying channel and converts payloads to/from
UTF-8 strings on the way in and out. Use it when you want the rest of your
code to deal in strings but the transport carries bytes.

```ts
import {Utf8Channel, WebSocketChannel} from '@jsonjoy.com/channel';

const inner = new WebSocketChannel<Uint8Array>({newSocket: () => new WebSocket(url)});
const channel = new Utf8Channel(inner);

channel.send('hello'); // encoded to UTF-8 bytes and sent through `inner`
channel.message$.subscribe((str) => console.log(str)); // already decoded
```

`Utf8Channel` shares the inner channel's `state$`, `open$`, `close$`, and
`error$` streams.


## Which to pick

| Need | Use |
|---|---|
| Streaming bidirectional connection | `WebSocketChannel` |
| Single-shot HTTP request/response per call | `FetchPhysicalChannel` |
| String API over a binary channel | `Utf8Channel` |
| Survive disconnects | wrap any of the above in [`PersistentPhysicalChannel`](/libs/channel/persistent-channel) |
