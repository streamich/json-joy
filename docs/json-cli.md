# Command-line interfaces

- `json-pointer` &mdash; finds a value in JSON document.
- `json-patch` &mdash; applies a JSON Patch to JSON document.
- `json-pointer-test` &mdash; runs tests against `json-pointer` CLI.
- `json-patch-test` &mdash; runs tests against `json-patch` CLI.

Install

```
npm i -g json-joy
```


## JSON Pointer CLI

Use

```
<json> | json-pointer <pointer>
```

Example

```
'{"foo": "bar"}' | json-pointer /foo
"bar"

```

## JSON Patch CLI

Use

```
json-patch <doc> <patch>
```

Example

```
json-patch '{"foo":"bar"}' '[{"op":"add","path":"/foo","value":"baz"}]'
{
    "foo": "baz"
}
```


## JSON Pointer CLI tests

Tests `json-pointer` CLI. Useful for testing `json-joy` implementation in different languages.

Use

```
json-pointer-test <path_to_json_pointer_cli>
```

Example

```
json-pointer-test json-pointer
```


# JSON Patch CLI tests

A command line tool for testing JSON Patch implementations. It expects a single
argument, which is a path to `json-patch` executable. It will run a test suite
through that executable.

```
json-patch-test json-patch
```
