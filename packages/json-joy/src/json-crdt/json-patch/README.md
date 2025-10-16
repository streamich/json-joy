## JSON Patch for JSON CRDT

This folder contains implementation of mapping JSON Patch operations to
JSON CRDT operations.

### Caveats

- The `test` operation will throw if the test fails. However, it will not
  make the whole patch fail, if all the `test` operations are not at the
  beginning of the patch. Make sure to put all the `test` operations at
  the beginning of the patch.
