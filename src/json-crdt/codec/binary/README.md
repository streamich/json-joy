# JSON CRDT document binary encoding

The binary encoding of a JSON CRDT document encodes the structure of the latest
state (snapshot) of a JSON CRDT document, which contains all the nodes and
tombstones necessary to be able to merge any subsequent patches, but does not
contain information to reconstruct previous patches.

This document specifies two types of encoding: (1) where logical clocks are used
as unique IDs; (2) where monotonically growing sequence number is used as unique
IDs.


## Message encoding

Notation in diagrams:

```
One byte:
+--------+
|        |
+--------+

Zero or more repeating bytes:
+........+
|        |
+........+

Zero or one byte which ends a repeating byte sequence:
+········+
|        |
+········+

Variable number of bytes:
+========+
|        |
+========+
```


## Document structure

The general structure of the document is composed of three sections:

1. Header section.
2. Optional, Vector clock table section.
3. Data section.


### The header section

The header begins with a single b1vuint56 value, where the first bit is a flag,
which encodes which vector clock type is used.

```
+===========+
| b1vuint56 |
+===========+
```

If the flag is set, the document is using "server timestamps" as unique IDs. Where
a timestamp is just an increasing sequence of numbers, and server enforces the
order. When the flag is set, the value of the b1vuint56 is the number which represents
the next timestamp in the document.

If the flag is not set, the document is using "logical timestamps" as unique IDs.
A logical timestamp is a 2-tuple, where the fist element is a randomly generated
editing session ID, and the second element is a monotonically increasing sequence
number. When the flag is not set, the value of the b1vuint56 is the length of the
clock table.


### The vector clock table section

The vector clock section is present only if the document uses logical timestamps
as IDs. If document uses increasing sequence numbers as IDs, this section is
empty.

The vector clock table section starts with a vuint57 integer. The value of this
integer specifies the number of entries in the vector clock section.

The remaining part of the vector clock section is composed of a flat list of
logical clock entries.

Each logical clock entry consists of: (1) a session ID; and (2) sequence time.

Each logical clock is encoded as uint53vuint39.

The first clock entry contains the session ID of the CRDT document. If the
sequence time part of the first entry is zero, it means no ID with that session
ID has been generated yet.


### The data section

The data section consists of the encoded root node.


#### Node encodings

The JSON document consists of the following seven node types: (1) root;
(2) object; (3) array; (4) string; (5) number; (6) boolean; (7) null.

Each node type, except the root node, starts with a leading byte, which identifies
the node type and its size.

| Node type         | Hexadecimal       | Binary                      | Description                                     |
|-------------------|-------------------|-----------------------------|-------------------------------------------------|
| uint7             | 0x00 - 0x7F       | `0b0.......`                | Unsigned 7 bit integer.                         |
| obj4              | 0x80 - 0x8F       | `0b1000....`                | Object with up to 15 chunks.                    |
| arr4              | 0x90 - 0x9F       | `0b1001....`                | Array with up to 15 chunks.                     |
| str5              | 0xA0 - 0xBF       | `0b101.....`                | String with up to 31 chunks.                    |
| null              | 0xC0              | `0b11000000`                | "null" value.                                   |
| undefined         | 0xC1              | `0b11000001`                | "undefined" value.                              |
| false             | 0xC2              | `0b11000010`                | "false" value.                                  |
| true              | 0xC3              | `0b11000011`                | "true" value.                                   |
| bin8              | 0xC4              | `0b11000100`                | Binary with up to 256 chunks.                   |
| bin16             | 0xC5              | `0b11000101`                | Binary with up to 65,535 chunks.                |
| bin32             | 0xC6              | `0b11000110`                | Binary with up to 4,294,967,295 chunks.         |
| float32           | 0xCA              | `0b11001010`                | 32-bit floating point number.                   |
| float64           | 0xCB              | `0b11001011`                | 64-bit floating point number.                   |
| uint8             | 0xCC              | `0b11001100`                | Unsigned 8 bit integer.                         |
| uint16            | 0xCD              | `0b11001101`                | Unsigned 16 bit integer.                        |
| uint32            | 0xCE              | `0b11001110`                | Unsigned 32 bit integer.                        |
| uint64            | 0xCF              | `0b11001111`                | Unsigned 64 bit integer (53 bit in JavaScript). |
| int8              | 0xD0              | `0b11010000`                | Signed 8 bit integer.                           |
| int16             | 0xD1              | `0b11010001`                | Signed 16 bit integer.                          |
| int32             | 0xD2              | `0b11010010`                | Signed 32 bit integer.                          |
| int64             | 0xD3              | `0b11010011`                | Signed 64 bit integer (53 bit in JavaScript).   |
| const             | 0xD4              | `0b11010100`                | Immutable JSON value.                           |
| val               | 0xD5              | `0b11010101`                | LWW JSON value register.                        |
| vallit            | 0xD6              | `0b11010110`                | LWW JSON value register encoded as literal.     |
| str8              | 0xD9              | `0b11011001`                | String with up to 255 chunks.                   |
| str16             | 0xDA              | `0b11011010`                | String with up to 65,535 chunks.                |
| str32             | 0xDB              | `0b11011011`                | String with up to 4,294,967,295 chunks.         |
| arr16             | 0xDC              | `0b11011100`                | Array with up to 65,535 chunks.                 |
| arr32             | 0xDD              | `0b11011101`                | Array with up to 4,294,967,295 chunks.          |
| obj16             | 0xDE              | `0b11011110`                | Object with up to 65,535 chunks.                |
| obj32             | 0xDF              | `0b11011111`                | Object with up to 4,294,967,295 chunks.         |
| nint5             | 0xE0 - 0xFF       | `0b111.....`                | Negative 5 bit integer.                         |

(The above encoding table is adopted from [MessagePack encoding](https://github.com/msgpack/msgpack/blob/master/spec.md#overview) format.)

##### Root node encoding

If document root node is empty, root node consists of a single zero byte.

If document root node has a value it is encoded as follows:

1. Relative ID of the operation used to set the root node.
2. Value of the root, encoded as a node.

The root node can appear in the document only once, as the very first node in
the data section.


##### Object node encoding

The object node contains the below parts in the following order.

1. First byte encodes whether the object node is of type `obj4`, `obj16` or `obj32`.
2. Followed by 0, 2, or 4 bytes of unsigned integer encoding of number of chunks.
2. ID of the object, encoded as a relative ID.
4. A flat list of object chunks.

The number of chunks is encoded with `s` bits as an unsigned integer.

```
obj4
+--------+========+========+
|1000ssss|   ID   | chunks |
+--------+========+========+

obj16
+--------+--------+--------+========+========+
|11011100|ssssssss|ssssssss|   ID   | chunks |
+--------+--------+--------+========+========+

obj32
+--------+--------+--------+--------+--------+========+========+
|11011101|ssssssss|ssssssss|ssssssss|ssssssss|   ID   | chunks |
+--------+--------+--------+--------+--------+========+========+
```

Each object chunk is encoded as follows:

1. ID of the operation that set this field, encoded as relative ID.
2. The length of field name, encoded as vuint57.
3. The field `name`, encoded in UTF-8.
4. Value of the field, encoded as a node.

```
One object chunk:
+========+=========+========+========+
|   ID   | vuint57 |  name  |  node  |
+========+=========+========+========+
```


##### Array node encoding

The array node contains the below parts in the following order.

1. First byte encodes whether the array node is of type `arr4`, `arr16` or `arr32`.
2. Followed by 0, 2, or 4 bytes of unsigned integer encoding of number of chunks.
2. ID of the array, encoded as a relative ID.
4. A flat list of array chunks.

The number of chunks is encoded with `s` bits as an unsigned integer.

```
arr4
+----|----+========+========+
|1001|ssss|   ID   | chunks |
+----^----+========+========+

arr16
+--------+--------+--------+========+========+
|11011100|ssssssss|ssssssss|   ID   | chunks |
+--------+--------+--------+========+========+

arr32
+--------+--------+--------+--------+--------+========+========+
|11011101|ssssssss|ssssssss|ssssssss|ssssssss|   ID   | chunks |
+--------+--------+--------+--------+--------+========+========+
```

Each array chunk contains the bellow parts in the following order.

1. Number of nodes in the chunk, encoded using b1vuint56.
   1. If b1vuint56 boolean bit is 1, the chunk is considered deleted. It is
      followed by the ID of the first chunk element, encode as a relative ID.
   2. If b1vuint56 boolean bit is 0, the following data contains the first chunk
      element ID, encoded as relative ID, followed a flat ordered list of nodes,
      encoded as nodes.

```
Deleted chunk:
+===========+========+
| b1vuint56 |   ID   |
+===========+========+

Not deleted chunk:
+===========+========+=========+
| b1vuint56 |   ID   |  nodes  |
+===========+========+=========+
```

Assuming the node count is encoded using `t` bits.

```
A deleted chunk:
+-|-------+........+········+========+
|1|?tttttt|?ttttttt|tttttttt|   ID   |
+-^-------+........+········+========+

A deleted chunk with three nodes:
+-|-------+========+
|1|0000011|   ID   |
+-^-------+========+

A deleted chunk with 256 nodes:
+-|-------+--------+========+
|1|1000000|00000100|   ID   |
+-^-------+--------+========+

A chunk with nodes which are not deleted:
+-|-------+........+········+========+=========+
|0|?tttttt|?ttttttt|tttttttt|   ID   |  nodes  |
+-^-------+........+········+========+=========+

A chunk with 3 nodes:
+-|-------+========+========+========+========+
|0|0000011|   ID   | node 1 | node 2 | node 3 |
+-^-------+========+========+========+========+
```


##### String node encoding

The string node contains the below parts in the following order.

1. First byte encodes whether the string node is of type `str5`, `str8`, `arr16` or `arr32`.
2. Followed by 0, 1, 2, or 4 bytes of unsigned integer encoding the number of chunks.
2. ID of the string, encoded as a relative ID.
4. A flat list of string chunks.

The number of chunks is encoded with `s` bits as an unsigned integer.

```
str5
+---|-----+========+========+
|101|sssss|   ID   | chunks |
+---^-----+========+========+

str8
+--------+--------+========+========+
|11011001|ssssssss|   ID   | chunks |
+--------+--------+========+========+

str16
+--------+--------+--------+========+========+
|11011010|ssssssss|ssssssss|   ID   | chunks |
+--------+--------+--------+========+========+

str32
+--------+--------+--------+--------+--------+========+========+
|11011011|ssssssss|ssssssss|ssssssss|ssssssss|   ID   | chunks |
+--------+--------+--------+--------+--------+========+========+
```

Each chunk contains the bellow parts in the following order.

1. The text length in the chunk, encoded as b1vuint56.
   1. If b1vuint56 boolean bit is 1, the text is considered deleted, there
      is no text contents to follow. The text length is used as the
      length of the UTF-8 text that was deleted.
   2. If b1vuint56 boolean bit is 0, the following `data` contains UTF-8 encoded
      text contents, where the length is the length in bytes of the UTF-8
      data.
2. ID of the first UTF-8 character in the chunk, encoded as a relative ID.
3. Chunk's UTF-8 text contents `text`, encoded as UTF-8 string, if b1vuint56
   boolean bit was set to 0, no data otherwise.

```
+===========+========+========+
| b1vuint56 |   ID   |  text  |
+===========+========+========+
```

Assuming the node count is encoded using `t` bits.

```
A deleted chunk:
+-|-------+........+········+========+
|1|?tttttt|?ttttttt|tttttttt|   ID   |
+-^-------+........+········+========+

A deleted chunk with text of length 3:
+-|-------+========+
|1|0000011|   ID   |
+-^-------+========+

A deleted chunk with text of length 256:
+-|-------+--------+========+
|1|1000000|00000100|   ID   |
+-^-------+--------+========+

A chunk with text which is not deleted:
+-|-------+........+········+========+========+
|0|?tttttt|?ttttttt|tttttttt|   ID   |  text  |
+-^-------+........+········+========+========+
```


##### Binary node encoding

The binary node contains the below parts in the following order.

1. First byte encodes whether the binary node is of type `bin8`, `bin16`, or `bin32`.
2. Followed by 1, 2, or 4 bytes of unsigned integer encoding the number of chunks.
2. ID of the binary, encoded as a relative ID.
4. A flat list of binary chunks.

The number of chunks is encoded with `s` bits as an unsigned integer.

```
bin8
+--------+--------+========+========+
|11000100|ssssssss|   ID   | chunks |
+--------+--------+========+========+

bin16
+--------+--------+--------+========+========+
|11000101|ssssssss|ssssssss|   ID   | chunks |
+--------+--------+--------+========+========+

bin32
+--------+--------+--------+--------+--------+========+========+
|11000110|ssssssss|ssssssss|ssssssss|ssssssss|   ID   | chunks |
+--------+--------+--------+--------+--------+========+========+
```

Each chunk contains the bellow parts in the following order.

1. The contents length in the chunk, encoded as b1vuint56.
   1. If b1vuint56 boolean bit is 1, the contents is considered deleted.
      There is no contents to follow.
   2. If b1vuint56 boolean bit is 0, then the value specifies the
      length of the following `data` binary contents of the chunk.
2. ID of the first UTF-8 character in the chunk, encoded as a relative ID.
3. Chunk's `data` contents, if b1vuint56 boolean bit was set to 0, no data otherwise.

```
+===========+========+========+
| b1vuint56 |   ID   |  data  |
+===========+========+========+
```

Assuming the node count is encoded using `t` bits:

```
A deleted chunk:
+-|-------+........+········+========+
|1|?tttttt|?ttttttt|tttttttt|   ID   |
+-^-------+........+········+========+

A deleted chunk with data contents of length 3:
+-|-------+========+
|1|0000011|   ID   |
+-^-------+========+

A deleted chunk with data contents of length 256:
+-|-------+--------+========+
|1|1000000|00000100|   ID   |
+-^-------+--------+========+

A chunk with data, which is not deleted:
+-|-------+........+········+========+========+
|0|?tttttt|?ttttttt|tttttttt|   ID   |  data  |
+-^-------+........+········+========+========+
```


##### Constant node encoding

Constant nodes are ones which contain a immutable JSON value, without any other
meta information.

If the value of the constant node is `null`, `undefined`, `false`, `true` or a number, the
node is encoded as MessagePack value.

```
null
+--------+
|  0xC0  |
+--------+

undefined
+--------+
|  0xC1  |
+--------+

false
+--------+
|  0xC2  |
+--------+

true
+--------+
|  0xC3  |
+--------+

uint7
+-|-------+
|0|xxxxxxx|
+-^-------+

float32
+--------+--------+--------+--------+--------+
|  0xCA  |xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|
+--------+--------+--------+--------+--------+

float64
+--------+--------+--------+--------+--------+--------+--------+--------+--------+
|  0xCB  |xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|
+--------+--------+--------+--------+--------+--------+--------+--------+--------+

uint8
+--------+--------+
|  0xCC  |xxxxxxxx|
+--------+--------+

uint16
+--------+--------+--------+
|  0xCD  |xxxxxxxx|xxxxxxxx|
+--------+--------+--------+

uint32
+--------+--------+--------+--------+--------+
|  0xCE  |xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|
+--------+--------+--------+--------+--------+

uint64
+--------+--------+--------+--------+--------+--------+--------+--------+--------+
|  0xCF  |xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|
+--------+--------+--------+--------+--------+--------+--------+--------+--------+

int8
+--------+--------+
|  0xD0  |xxxxxxxx|
+--------+--------+

int16
+--------+--------+--------+
|  0xD1  |xxxxxxxx|xxxxxxxx|
+--------+--------+--------+

int32
+--------+--------+--------+--------+--------+
|  0xD2  |xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|
+--------+--------+--------+--------+--------+

int64
+--------+--------+--------+--------+--------+--------+--------+--------+--------+
|  0xD3  |xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|
+--------+--------+--------+--------+--------+--------+--------+--------+--------+

nint5
+---|-----+
|111|xxxxx|
+---^-----+
```

If the value of the constant node is string, array or object, it is encoded
as a `const` node, which consists of:

1. Leading 0xD4 byte.
2. JSON value `data`, encoded in MessagePack format.

```
const
+--------+========+
|  0xD4  |  data  |
+--------+========+
```


##### Value node encoding

Value nodes are LWW registers which contain immutable JSON value.

A value node is encoded as a `val` node, which consists of:

1. Leading 0xD5 byte.
2. ID of the node `id`, encoded as a relative ID.
3. ID of the last write operation `writeId`, encoded as a relative ID.
4. JSON value `data`, encoded in MessagePack format.

```
val
+--------+========+=========+========+
|  0xD5  |   id   | writeId |  data  |
+--------+========+=========+========+
```


## Encoding components

### Relative ID

*Absolute IDs* (or simply IDs) are unique totally ordered identifiers, used to
identify everything that needs identification in the document such as its
structural parts and/or operations.

A *relative ID* is a compact way to encode an absolute ID, however, to decode
back the relative ID to an absolute ID, the vector clock table of the document
is used or the latest sequence number of the document is used.

Each relative ID is encoded differently, depending if the document uses logical
clocks or sequence numbers for absolute IDs.

#### When document uses logical clocks

Each relative ID is a 2-tuple.

1. The first element is the index in the vector
   clock table. For example, 1 means "the first logic clock" in the vector clock
   table, or 4 means "the fourth logical clock" in the vector clock table.
2. The second element encodes the difference of the time between the time of 
   the logical clock in the vector clock table and the time component of the
   absolute ID.

In the below encoding diagrams bits are annotated as follows:

- "x" - vector table index, reference to the logical clock.
- "y" - time difference.
- "?" - whether the next byte is used for encoding.

If x is less than 8 and y is less than 16, the relative ID is encoded as a
single byte:

```
+-|---|----+
|0|xxx|yyyy|
+-^---^----+
```

Otherwise the top bit of the first byte is set to 1; and x and y are encoded
separately using b1vuint28 and vuint39, respectively.

```
      x          y
+===========+=========+
| b1vuint28 | vuint39 |
+===========+=========+
```

The boolean flag of x b1vuint28 value is always set to 1.


#### When document uses sequence numbers

Each relative ID is the difference between documents sequence number and the
absolute ID and is encoded as vuint57.

```
+=========+
| vuint57 |
+=========+
```


### Variable length integers


#### `vuint57` (variable length unsigned 57 bit integer)

Variable length unsigned 57 bit integer is encoded using up to 8 bytes. The maximum
size of the decoded value is 57 bits of data.

The high bit "?" of each byte indicates if the next byte should be consumed, up
to 8 bytes.

```
byte 1                                                         byte 8
+--------+........+........+........+........+........+........+········+
|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|zzzzzzzz|
+--------+........+........+........+........+........+........+········+

           11111    2211111  2222222  3333332  4443333  4444444 55555555
  7654321  4321098  1098765  8765432  5432109  2109876  9876543 76543210
    |                        |                    |             |
    5th bit of z             |                    |             |
                             28th bit of z        |             57th bit of z
                                                  39th bit of z
```

Encoding examples:

```
+--------+
|0zzzzzzz|
+--------+

+--------+--------+
|1zzzzzzz|0zzzzzzz|
+--------+--------+

+--------+--------+--------+
|1zzzzzzz|1zzzzzzz|0zzzzzzz|
+--------+--------+--------+

+--------+--------+--------+--------+
|1zzzzzzz|1zzzzzzz|1zzzzzzz|0zzzzzzz|
+--------+--------+--------+--------+

+--------+--------+--------+--------+--------+
|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|0zzzzzzz|
+--------+--------+--------+--------+--------+

+--------+--------+--------+--------+--------+--------+
|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|0zzzzzzz|
+--------+--------+--------+--------+--------+--------+

+--------+--------+--------+--------+--------+--------+--------+
|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|0zzzzzzz|
+--------+--------+--------+--------+--------+--------+--------+

+--------+--------+--------+--------+--------+--------+--------+--------+
|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|zzzzzzzz|
+--------+--------+--------+--------+--------+--------+--------+--------+
```


#### `vuint39` (variable length unsigned 39 bit integer)

Variable length unsigned 39 bit integer is encoded using up to 6 bytes. The maximum
size of the decoded value is 39 bits of data.

The high bit "?" of each byte indicates if the next byte should be consumed, up
to 6 bytes.

```
byte 1                                       byte 6
+--------+........+........+........+........+········+
|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|0000zzzz|
+--------+........+........+........+........+········+

           11111    2211111  2222222  3333332     3333
  7654321  4321098  1098765  8765432  5432109     9876
    |                        |                    |
    5th bit of z             |                    39th bit of z
                             28th bit of z
```

Encoding examples:

```
+--------+
|x0zzzzzz|
+--------+

+--------+--------+
|x1zzzzzz|0zzzzzzz|
+--------+--------+

+--------+--------+--------+
|x1zzzzzz|1zzzzzzz|0zzzzzzz|
+--------+--------+--------+

+--------+--------+--------+--------+
|x1zzzzzz|1zzzzzzz|1zzzzzzz|0zzzzzzz|
+--------+--------+--------+--------+

+--------+--------+--------+--------+--------+
|x1zzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|0zzzzzzz|
+--------+--------+--------+--------+--------+

+--------+--------+--------+--------+--------+--------+
|x1zzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|0000zzzz|
+--------+--------+--------+--------+--------+--------+
```


#### `b1vuint56` (variable length unsigned 56 bit integer with 1 bit bitfield)

Boolean variable length unsigned 56 bit integer with 1 bit bitfield is encoded
in a similar way to vuint57, but the first bit x is used for storing a boolean
value.

b1vuint56 is encoded using up to 8 bytes. Because the first bit is used to store
a boolean value, the maximum integer data b1vuint56 can hold is 56 bits.

```
byte 1                                                          byte 8
+-|-------+........+........+........+........+........+........+········+
|x|?zzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|zzzzzzzz|
+-^-------+........+........+........+........+........+........+········+
 |
 |          11111    2111111  2222222  3333322  4433333  4444444 55555554
 |  654321  3210987  0987654  7654321  4321098  1098765  8765432 65432109
 |   |                        |                    |             |
 |   5th bit of z             |                    |             |
 |                            27th bit of z        |             56th bit of z
 |                                                 38th bit of z
 x stores a boolean value
```

Encoding examples:

```
+-|-------+
|x|0zzzzzz|
+-^-------+

+-|-------+--------+
|x|1zzzzzz|0zzzzzzz|
+-^-------+--------+

+-|-------+--------+--------+
|x|1zzzzzz|1zzzzzzz|0zzzzzzz|
+-^-------+--------+--------+

+-|-------+--------+--------+--------+
|x|1zzzzzz|1zzzzzzz|1zzzzzzz|0zzzzzzz|
+-^-------+--------+--------+--------+

+-|-------+--------+--------+--------+--------+
|x|1zzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|0zzzzzzz|
+-^-------+--------+--------+--------+--------+

+-|-------+--------+--------+--------+--------+--------+
|x|1zzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|0zzzzzzz|
+-^-------+--------+--------+--------+--------+--------+

+-|-------+--------+--------+--------+--------+--------+--------+
|x|1zzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|0zzzzzzz|
+-^-------+--------+--------+--------+--------+--------+--------+

+-|-------+--------+--------+--------+--------+--------+--------+--------+
|x|1zzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|zzzzzzzz|
+-^-------+--------+--------+--------+--------+--------+--------+--------+
```


#### `b1vuint28` (variable length unsigned 28 bit integer with 1 bit bitfield)

Boolean variable length unsigned 28 bit integer with 1 bit bitfield is encoded
in a similar way to b1vuint56, but the numeric value expands only up to 4 bytes.

b1vuint28 is encoded using up to 4 bytes. Because the first bit is used to store
a boolean value, the maximum integer data b1vuint28 can hold is 28 bits.

```
byte 1                      byte 4
+-|-------+........+........+········+
|x|?zzzzzz|?zzzzzzz|?zzzzzzz|zzzzzzzz|
+-^-------+........+........+········+
 |
 |          11111    2111111 22222222
 |  654321  3210987  0987654 87654321
 |   |                        |
 |   5th bit of z             |
 |                            27th bit of z
 |
 x stores a boolean value
```

Encoding examples:

```
+-|-------+
|x|0zzzzzz|
+-^-------+

+-|-------+--------+
|x|1zzzzzz|0zzzzzzz|
+-^-------+--------+

+-|-------+--------+--------+
|x|1zzzzzz|1zzzzzzz|0zzzzzzz|
+-^-------+--------+--------+

+-|-------+--------+--------+--------+
|x|1zzzzzz|1zzzzzzz|1zzzzzzz|zzzzzzzz|
+-^-------+--------+--------+--------+
```


#### `uint53vuint39` (unsigned 53 bit integer and variable length unsigned 39 bit integer)

uint53vuint39 specifies encoding of a 2-tuple, which consists of

1. Unsigned 53 bit integer, in below diagrams represented by "x"..
2. Variable length unsigned 39 bit integer, in below diagrams represented by "z".

Each uint53vuint39 entry is variable length. It is at least 8 bytes long and at
most 12 bytes long.

The "x" is always encoded as a 53-bit unsigned integer. The "z"
is encoded as an unsigned integer of at least 10-bits to at most 39-bits in
size.

The "?" bit specifies whether the next byte should be used for "z" decoding. If
"?" is set to 1, the next byte should be read. If "?" is set to 0, no
further bytes should be read after the byte containing the "?" set to 0.

Encoding schema:

```
byte 1                                                          byte 8                              byte 12
+--------+--------+--------+--------+--------+--------+-----|---+--------+........+........+........+········+
|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxx|?zz|zzzzzzzz|?zzzzzzz|?zzzzzzz|?zzzzzzz|zzzzzzzz|
+--------+--------+--------+--------+--------+--------+-----^---+--------+........+........+........+········+

 33322222 22222111 1111111           44444444 43333333 55554 .1           .1111111 .2222211 .3322222 33333333
 21098765 43210987 65432109 87654321 87654321 09876543 32109 .09 87654321 .7654321 .4321098 .1098765 98765432
 |                                     |               |      |                       |
 |                                     |               |      10th bit of z           |
 |                                     46th bit of x   |                              |
 |                                                     |                              22nd bit of z
 |                                                     53rd bit of x
 32nd bit of x
```

Encoding examples of all the different length possibilities.

```
+--------+--------+--------+--------+--------+--------+-----|---+--------+
|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxx|0zz|zzzzzzzz|
+--------+--------+--------+--------+--------+--------+-----^---+--------+

+--------+--------+--------+--------+--------+--------+-----|---+--------+········+
|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxx|1zz|zzzzzzzz|0zzzzzzz|
+--------+--------+--------+--------+--------+--------+-----^---+--------+········+

+--------+--------+--------+--------+--------+--------+-----|---+--------+........+········+
|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxx|1zz|zzzzzzzz|1zzzzzzz|0zzzzzzz|
+--------+--------+--------+--------+--------+--------+-----^---+--------+........+········+

+--------+--------+--------+--------+--------+--------+-----|---+--------+........+........+········+
|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxx|1zz|zzzzzzzz|1zzzzzzz|1zzzzzzz|0zzzzzzz|
+--------+--------+--------+--------+--------+--------+-----^---+--------+........+........+········+

+--------+--------+--------+--------+--------+--------+-----|---+--------+........+........+........+········+
|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxxxxx|xxxxx|1zz|zzzzzzzz|1zzzzzzz|1zzzzzzz|1zzzzzzz|zzzzzzzz|
+--------+--------+--------+--------+--------+--------+-----^---+--------+........+........+........+········+
```
