## JSON Patch CLI

CLI executable to apply JSON Patch to a JSON document.

`json-patch` CLI executable works as follows:

- Receives a JSON document through STDIN.
- Receives JSON Patch array as the first CLI argument.
- Returns patch application result through STDOUT.

## Installation

```
npm install -g json-joy
```

## Usage

```
<json> | json-patch <patch>
```

## Example

```
echo '{"foo":"bar"}' | json-patch '[{"op":"add","path":"/foo","value":"baz"}]'
{
    "foo": "baz"
}
```
