## JSON Pack CLI

CLI executable to encode JSON document in [MessagePack](https://msgpack.org/index.html) format.

`json-pack` CLI executable works as follows:

- Receives a JSON document through STDIN.
- Returns MessagePack encoded binary data through STDOUT.

Supports binary data.

## Installation

```
npm install -g json-joy
```

## Usage

```
<json> | json-pack
```

## Example

```
echo '{"foo":"bar"}' | json-pack
��foo�bar
```
