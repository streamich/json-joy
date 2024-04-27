# JSON Predicate

All [JSON Predicate][json-predicate] operations are implemented, which includes:

- `test`
- `contains`
- `defined`
- `ends`
- `in`
- `less`
- `matches`
- `more`
- `starts`
- `test`
- `type`
- `undefined`
- `and`
- `not`
- `or`

Only a subset of types supported by `type` operation are implemented.

By default `validateOperations` does not allow `match` operation, as it uses
regular expressions and be exploited using ReDoS attacks, but you can allow it
through options argument.

[json-predicate]: https://tools.ietf.org/id/draft-snell-json-test-01.html
