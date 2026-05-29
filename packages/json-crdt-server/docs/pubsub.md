## Pub/Sub

Lightweight publish/subscribe messaging on named channels. Messages are not
persisted --- subscribers receive only messages published while they are
listening.


## Methods

| Method | Streaming | Purpose |
|---|---|---|
| `pubsub.publish` | --- | Send a message to a channel |
| `pubsub.listen` | yes | Subscribe to a channel |


## `pubsub.publish`

Send a message to all current subscribers of `channel`. Returns immediately;
delivery is fire-and-forget.

```
Request:  {channel, message: any}
Response: {}
```

The `message` can be any value that the negotiated value codec can encode
(JSON, CBOR, MessagePack). For binary payloads, send a `Uint8Array` directly
when using CBOR or MessagePack --- avoids base64 round-tripping.


## `pubsub.listen`

Streaming subscription. Emits one event per published message until the
subscription is cancelled.

```
Request:  {channel}
Stream:   {message: any}
```


## When to use this

| Need | Use |
|---|---|
| Notify peers of an external event with no replay | `pubsub.*` |
| CRDT-merged shared state | [Blocks](/libs/json-crdt-server/block-api) |
| Cursors / "who's here" with TTL | [Presence](/libs/json-crdt-server/presence) |

There is no authentication, room scoping, or rate limiting on pub/sub by
default --- if you need any of that, embed the server (see
[Embedding](/libs/json-crdt-server/embedding)) and wrap the methods.
