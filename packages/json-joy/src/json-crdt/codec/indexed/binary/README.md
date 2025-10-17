## Binary Indexed Format

The Binary Index encoding format for JSON CRDT returns a flat map, where each
key is a string and each value is an `Uint8Array` blob.

The map has the following keys:

- `"r"` - ID of the root node.
- `"c"` - Clock table of the document.
- `"{sid}_{time}` - Each key is a string of the form `{sid}_{time}`, where
  `sid` is the session ID index in the clock table encoded as Base36 and `time`
  is the logical clock sequence number encoded as Base36. The value is the
  encoded node.
