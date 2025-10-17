## JSON Pack CLI tests

The `json-pack-test` CLI executable is designed to test [`json-pack` CLI
executable](./json-pack.md). Useful for testing MessagePack
implementations in different programming languages.

It expects a single argument, which is a path to [`json-pack` executable](./json-pack.md). It
will run a test suite through that executable.

## Installation

```
npm install -g json-joy
```

## Usage

```
json-pack-test <path_to_json_pack_cli>
```

## Example

```
json-pack-test json-pack
```

Sample output:

```
Running json-pack tests.

✅ 10.nil.yaml null
✅ 11.bool.yaml false
✅ 11.bool.yaml true
✅ 20.number-positive.yaml 0
✅ 20.number-positive.yaml 1
✅ 20.number-positive.yaml 127
✅ 20.number-positive.yaml 128
✅ 20.number-positive.yaml 255
✅ 20.number-positive.yaml 256
✅ 20.number-positive.yaml 65535
✅ 20.number-positive.yaml 65536
✅ 20.number-positive.yaml 2147483647
✅ 20.number-positive.yaml 2147483648
✅ 20.number-positive.yaml 4294967295
✅ 21.number-negative.yaml -1
✅ 21.number-negative.yaml -32
✅ 21.number-negative.yaml -33
✅ 21.number-negative.yaml -128
✅ 21.number-negative.yaml -256
✅ 21.number-negative.yaml -32768
✅ 21.number-negative.yaml -65536
✅ 21.number-negative.yaml -2147483648
✅ 22.number-float.yaml 0.5
✅ 22.number-float.yaml -0.5
✅ 30.string-ascii.yaml ""
✅ 30.string-ascii.yaml "a"
✅ 30.string-ascii.yaml "1234567890123456789012345678901"
✅ 30.string-ascii.yaml "12345678901234567890123456789012"
✅ 31.string-utf8.yaml "Кириллица"
✅ 31.string-utf8.yaml "ひらがな"
✅ 31.string-utf8.yaml "한글"
✅ 31.string-utf8.yaml "汉字"
✅ 31.string-utf8.yaml "漢字"
✅ 32.string-emoji.yaml "❤"
✅ 32.string-emoji.yaml "🍺"
✅ 40.array.yaml []
✅ 40.array.yaml [1]
✅ 40.array.yaml [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
✅ 40.array.yaml [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
✅ 40.array.yaml ["a"]
✅ 41.map.yaml {}
✅ 41.map.yaml {"a":1}
✅ 41.map.yaml {"a":"A"}
✅ 42.nested.yaml [[]]
✅ 42.nested.yaml [{}]
✅ 42.nested.yaml {"a":{}}
✅ 42.nested.yaml {"a":[]}

Successful = 47, Failed = 0, Total = 47
```
