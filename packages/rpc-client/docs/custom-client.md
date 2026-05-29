## Custom client

The factories on the previous page are short and worth reading --- they
unpack the entire setup in about a dozen lines:

```ts
import {RxPersistentCaller} from '@jsonjoy.com/rpc-calls';
import {WebSocketChannel} from '@jsonjoy.com/channel';

export const createClient = (codec, url, token?) => {
  const protocols = [codec.specifier()];
  if (token) protocols.push(token);
  const client = new RxPersistentCaller({
    codec,
    physical: {
      newChannel: () => new WebSocketChannel({
        newSocket: () => new WebSocket(url, protocols),
      }),
    },
  });
  client.start();
  return client;
};
```

Skip the factories whenever you need to deviate from this shape.


## Tuning reconnect

Pass `physical.minReconnectionDelay`, `maxReconnectionDelay`,
`reconnectionDelayGrowFactor`, and `minUptime` straight through to the
[`PersistentPhysicalChannel`](/libs/channel/persistent-channel):

```ts
new RxPersistentCaller({
  codec,
  physical: {
    newChannel: () => /* ... */,
    minReconnectionDelay: 500,
    maxReconnectionDelay: 30_000,
    reconnectionDelayGrowFactor: 1.5,
    minUptime: 10_000,
  },
});
```


## Disabling or retiming keep-alive

```ts
new RxPersistentCaller({
  codec,
  physical: {...},
  ping: 0,                    // disable
  // ping: 30000,             // every 30s instead of 15
  pingMethod: '.heartbeat',   // custom notification name
});
```

The server-side dispatcher must treat the chosen notification as a no-op.
The default `.ping` is special-cased by [`rpc-server`](/libs/rpc-server)'s
HTTP `/ping` endpoint --- using a custom name for WebSocket pings is fine
because notifications don't require a registered method.


## Bring your own transport

`RxPersistentCaller` needs anything that satisfies
`PersistentPhysicalChannelOptions<Uint8Array>`. Use this seam to plug in
non-WebSocket transports (e.g. WebTransport, IPC, mocks):

```ts
new RxPersistentCaller({
  codec,
  physical: {
    newChannel: () => new MyCustomChannel(),
  },
});
```

As long as the channel emits `message$` of `Uint8Array` and accepts
`send(Uint8Array)`, it works.


## Auth flows other than tokens

The bundled factories embed the token in the WebSocket subprotocol list,
which is the cheapest way to authenticate a fresh connection. For
authentication patterns that don't fit that mould (cookies, signed query
parameters, refresh-on-401), use the WebSocket URL directly:

```ts
const url = `wss://example.com/rx?session=${encodeURIComponent(sessionId)}`;
const client = createBinaryClient(url);
```

The server's [token extractor](/libs/rpc-server/connection-context) reads
the query string too.


## Type-safe methods

The `Caller` interface is generic on a `CallerMethods` map:

```ts
type Methods = {
  'block.get': [{id: string}, {block: ServerBlock}];
  'util.ping': [void, 'pong'];
};

const client: Caller<Methods> = createBinaryClient<Methods>(url);

// Typed:
const {block} = await client.call('block.get', {id: 'doc-42'});
```

For schema-driven projects, generate the `Methods` map from a JSON Type
router (see [`json-crdt-server`](/libs/json-crdt-server) for an example).
