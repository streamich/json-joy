# JSON Patch CLI tests

The `json-patch-test` CLI executable is designed to test [`json-patch` CLI
executable](./json-patch.md). Useful for testing `json-joy` JSON Patch
implementations in different programming languages.

It expects a single argument, which is a path to [`json-patch` executable](./json-patch.md). It
will run a test suite through that executable.


## Usage

```
json-patch-test <path_to_json_patch_cli>
```


## Example

```
json-patch-test json-patch
```
