# JSON Pointer CLI

JSON Pointer as a CLI.

`json-pointer` CLI executable works as follows:

- Receives a JSON value through STDIN.
- Receives a JSON Pointer as the first CLI argument.
- Returns resolved value through STDOUT.

## Installation

```
npm install -g json-joy
```

## Usage

```
<json> | json-pointer <pointer>
```

## Example

```
echo '{"foo": "bar"}' | json-pointer /foo
"bar"
```
