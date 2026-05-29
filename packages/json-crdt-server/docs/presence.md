## Presence

Per-room user presence with TTL-based expiration. Each entry has an `id`
within a `room`, plus a free-form `data` payload that the server merges on
updates. Entries expire 30 seconds after the last update.

Common use cases: cursors, online status, currently-viewing-document badges.


## Methods

| Method | Streaming | Purpose |
|---|---|---|
| `presence.update` | --- | Upsert an entry; refreshes the TTL |
| `presence.listen` | yes | Subscribe to all entries in a room |
| `presence.remove` | --- | Delete an entry and notify listeners |


## `presence.update`

Upsert an entry. The `data` payload is *merged* with the existing entry, so
clients can update just one field at a time.

```
Request:  {room, id, data: any}
Response: {entry, time}
```

Example: update a cursor position.

```json
{
  "room": "doc-42",
  "id": "user-1",
  "data": {"name": "John", "cursor": [123, 456]}
}
```

Every successful `update` resets the entry's 30-second TTL. Clients should
re-`update` on an interval (e.g. every 15 s) to stay alive.


## `presence.listen`

Streaming subscription. On subscribe, the first emission contains all current
entries in the room. Subsequent emissions are sent whenever any entry is
created, updated, or removed.

```
Request:  {room}
Stream:   {entries: [entry...], time}
```


## `presence.remove`

Explicitly delete an entry. Listeners receive the resulting state in the
next stream emission.

```
Request:  {room, id}
Response: {}
```


## When to use this vs. blocks

Presence is intentionally ephemeral and non-CRDT. There is no history, no
conflict resolution, and no persistence --- if the server restarts, all
presence state is gone. Use it for transient UI state. For anything that
needs to outlive a session, store it on a [block](/libs/json-crdt-server/block-api).
