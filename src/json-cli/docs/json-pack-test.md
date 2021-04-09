## JSON Pack CLI tests

The `json-pack-test` CLI executable is designed to test [`json-pack` CLI
executable](./json-pack.md). Useful for testing MessagePack
implementations in different programming languages.

It expects a single argument, which is a path to [`json-pack` executable](./json-pack.md). It
will run a test suite through that executable.


## Usage

```
json-pack-test <path_to_json_pack_cli>
```


## Example

```
json-pack-test json-pack
```
