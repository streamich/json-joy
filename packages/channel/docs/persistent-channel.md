## Persistent channel

`PersistentPhysicalChannel<T>` keeps a connection alive across drops. It is **not** itself
a `PhysicalChannel` --- it owns one at a time and recreates
it via the `newChannel` factory whenever the previous one closes.

```ts
import {PersistentPhysicalChannel, WebSocketChannel}
  from '@jsonjoy.com/channel';

const persistent = new PersistentPhysicalChannel<Uint8Array>({
  newChannel: () =>
    new WebSocketChannel({
      newSocket: () =>
        new WebSocket('wss://example.com/rx')
    }),
});

persistent.start();
persistent.message$.subscribe((data) => handle(data));
```


## Options

| Option | Default | Description |
|---|---|---|
| `newChannel` | required | Called on every (re)connect to build a fresh channel |
| `minReconnectionDelay` | 1000--2000 ms | Floor for the first backoff |
| `maxReconnectionDelay` | 10000 ms | Ceiling for the backoff |
| `reconnectionDelayGrowFactor` | 1.3 | Base of the exponential backoff |
| `minUptime` | 5000 ms | A connection must stay open this long to reset the retry counter |


## Lifecycle

```ts
persistent.start();   // begin keeping a connection open
persistent.stop();    // close, dispose, no further use possible
```

After `stop()`, all subjects are completed and the instance cannot be
restarted. Construct a new one if you need to reconnect later.


## Observable surface

| Stream | Emits |
|---|---|
| `active$` | `true` while `start()` was called and not yet stopped |
| `channel$` | The current underlying `PhysicalChannel`, or `undefined` |
| `open$` | `true` whenever the active channel is open, `false` otherwise |
| `message$` | Incoming messages from whichever underlying channel is current |
| `error$` | Errors from the channel factory or underlying channels |


## Sending

```ts
persistent.send$(payload).subscribe();
```

`send$` waits for the next open connection, then sends. There is no
synchronous `send` --- by design, the caller is forced to opt into the
waiting behavior, which is what you almost always want when reconnect can
happen at any time.


## Backoff

`reconnectDelay()` returns the wait time before the next attempt:

```
delay = min(
  maxReconnectionDelay,
  minReconnectionDelay * reconnectionDelayGrowFactor ** (retries - 1)
)
```

If a connection stays open longer than `minUptime`, the retry counter
resets to 0 --- the next disconnect will reconnect quickly.
