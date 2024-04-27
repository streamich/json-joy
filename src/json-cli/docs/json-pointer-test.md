## JSON Pointer CLI tests

The `json-pointer-test` CLI executable is designed to test [`json-pointer` CLI
executable](./json-pointer.md). Useful for testing `json-joy` JSON Pointer
implementations in different programming languages.

It expects a single argument, which is a path to [`json-pointer` executable](./json-pointer.md). It
will run a test suite through that executable.

## Usage

```
json-pointer-test <path_to_json_pointer_cli>
```

## Example

```
json-pointer-test json-pointer
```

Sample output:

```
Running JSON Pointer tests.

✅ Retrieves first level key from object
✅ Can find number root
✅ Can find string root
✅ Returns container object and key
✅ Can reference array element
✅ Throws "NOT_FOUND" on missing keys two levels deep
✅ Throws "INVALID_INDEX" when pointing past array boundary
✅ Throws "INVALID_INDEX" when pointing to negative element
✅ RFC6901 Section 5. ""
✅ RFC6901 Section 5. "/foo"
✅ RFC6901 Section 5. "/foo/0"
✅ RFC6901 Section 5. "/"
✅ RFC6901 Section 5. "/a~1b"
✅ RFC6901 Section 5. "/c%d"
✅ RFC6901 Section 5. "/e^f"
✅ RFC6901 Section 5. "/g|h"
✅ RFC6901 Section 5. "/i\j"
✅ RFC6901 Section 5. "/k"l"
✅ RFC6901 Section 5. "/ "
✅ RFC6901 Section 5. "/m~0n"

Successful = 20, Failed = 0, Total = 20

Done in 0.80s.
```
