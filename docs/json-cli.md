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
