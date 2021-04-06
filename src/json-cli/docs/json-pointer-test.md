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
