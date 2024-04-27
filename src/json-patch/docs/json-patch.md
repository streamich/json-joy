# JSON Patch

All [JSON Patch][json-patch] operations are implemented, which includes:

- `add`
- `remove`
- `replace`
- `move`
- `copy`
- `test`

The `test` operation is further extended with optional `not` property. If `not`
is set to `true`, the result of `test` operation is inverted.

[json-patch]: https://tools.ietf.org/html/rfc6902
