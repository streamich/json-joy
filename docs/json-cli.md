# JSON Patch CLI

Install

```
npm i -g json-joy
```

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

# JSON Patch test CLI

A command line tool for testing JSON Patch implementations. It expects a single
argument, which is a path to `json-patch` executable. It will run a test suite
through that executable.

```
json-patch-test json-patch
```
