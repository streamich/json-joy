## PhysicalChannel

`PhysicalChannel<T>` is the interface every concrete transport implements.
`T` is the message payload type --- either `string`, `Uint8Array`, or the
union of both.

```ts
interface PhysicalChannel<T extends string | Uint8Array> {
  // Reactive surface
  state$:    BehaviorSubject<ChannelState>;
  open$:     Observable<PhysicalChannel<T>>;
  close$:    Observable<[self: PhysicalChannel<T>, event: CloseEventBase]>;
  error$:    Observable<Error>;
  message$:  Observable<T>;

  // Imperative surface
  closed:    boolean;
  onmessage?: (data: T, isUtf8: boolean) => void;
  onclose?:   (code: number, reason: string, wasClean: boolean) => void;

  isOpen():  boolean;
  send(data: T):    number;            // returns bytes buffered, -1 if not ready
  send$(data: T):   Observable<number>; // waits for open, then sends
  close(code?, reason?): void;
  buffer():  number;                   // bytes currently buffered out
}
```


## States

The `ChannelState` enum reflects the connection lifecycle:

| Value | Meaning |
|---|---|
| `CONNECTING` | Initial; not yet open |
| `OPEN` | Ready to send/receive |
| `CLOSED` | Terminal; cannot be reopened |

`state$` is a `BehaviorSubject`, so subscribers get the current state
immediately. `open$` and `close$` are `ReplaySubject(1)` --- subscribing
after the event still fires the callback.


## Two ways to subscribe

`message$` (observable) and `onmessage` (callback) deliver the same data.
Pick whichever fits the consumer:

```ts
// Callback flavor
channel.onmessage = (data, isUtf8) => handle(data);

// RxJS flavor
channel.message$.subscribe((data) => handle(data));
```

Same applies to close: `onclose` and `close$` both fire once on disconnect.


## `send()` vs `send$()`

- `send(data)` is **fire-and-forget**: writes immediately if open, returns
  the number of bytes now buffered. Returns `-1` if the channel is not
  ready --- useful as a quick liveness check.
- `send$(data)` is **wait-then-send**: returns an Observable that defers
  until `open$` fires. Errors if the channel closes first.

```ts
// Fire only if connected right now
if (channel.isOpen()) channel.send(message);

// Queue until the channel opens (e.g. immediately after construction)
channel.send$(message).subscribe();
```


## Close event

Both `close$` and `onclose` carry a `CloseEventBase`:

| Field | Description |
|---|---|
| `code` | Numeric close code (e.g. 1000 for normal closure) |
| `reason` | Free-form reason text |
| `wasClean` | Whether the close handshake completed |

`code` follows WebSocket conventions where applicable but every transport
chooses its own scheme for non-WebSocket scenarios.
