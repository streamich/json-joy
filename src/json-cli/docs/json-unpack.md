## JSON Unpack CLI

CLI executable to decodes JSON document from [MessagePack](https://msgpack.org/index.html) binary blob.

`json-unpack` CLI executable works as follows:

- Receives a MessagePack encoded binary document through STDIN.
- Returns JSON document through STDOUT.


## Usage

```
<MessagePack> | json-unpack
```


## Example

```
echo '{"foo":"bar"}' | json-pack | json-unpack
{"foo":"bar"}
```
