# JSON CRDT document binary encoding

The binary encoding of a JSON CRDT document encodes the structure of the latest
state of a JSON CRDT document, which contains all the nodes and tombstones
necessary to be able to merge any subsequent patches, but does not contain
information to reconstruct previous patches.


## Document structure

The general structure of the document is composed of three sections:

1. Header section.
2. Vector clock section.
3. Data section.


### The header section

The header consists of a zero bytes.


### The vector clock section

The vector clock section starts with a bvaruint8 integer. The boolean bit is set
to 0. The value of this integer specifies the number of entries in the vector
clock section.

The remaining part of the vector clock section is composed of a flat ordered
list of vector clock entries.

Each vector clock entry consists of: (1) a session ID; and (2) sequence time.

In below diagrams session ID is encoded as "x" and sequence time is encoded as
"z".

Each vector clock entry is variable length. It is at least 8 bytes long or at
most 12 bytes long.

The session ID is always encoded as a 53-bit unsigned integer. The sequence time
is encoded as an unsigned integer of at least 10-bits to at most 39-bits in
size.

The "?" bit specifies whether the next byte is part of the current vector clock
entry. If "?" is set to 1, the next byte should be read. If "?" is set to 0, no
further bytes should be read after the byte containing the "?" set to 0.

Encoding schema:

```
byte 1   byte 2   byte 2   byte 4   byte 5   byte 6   byte 7   byte 8   byte 9   byte 10  byte 11  byte 12
xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxx?zz zzzzzzzz ?zzzzzzz ?zzzzzzz ?zzzzzzz zzzzzzzz
33322222 22222111 1111111           44444444 43333333 55554.1           .1111111 .2222211 .3322222 33333333
21098765 43210987 65432109 87654321 87654321 09876543 32109.09 87654321 .7654321 .4321098 .1098765 98765432
|                                     |               |     |                       |
|                                     |               |     10th bit of z           |
|                                     46th bit of x   |                             |
|                                                     |                             22nd bit of z
|                                                     53rd bit of x
32nd bit of x
```

Encoding examples of all the different length possibilities.

```
byte 1   byte 2   byte 2   byte 4   byte 5   byte 6   byte 7   byte 8
xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxx0zz zzzzzzzz

byte 1   byte 2   byte 2   byte 4   byte 5   byte 6   byte 7   byte 8   byte 9
xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxx1zz zzzzzzzz 0zzzzzzz

byte 1   byte 2   byte 2   byte 4   byte 5   byte 6   byte 7   byte 8   byte 9   byte 10
xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxx1zz zzzzzzzz 1zzzzzzz 0zzzzzzz

byte 1   byte 2   byte 2   byte 4   byte 5   byte 6   byte 7   byte 8   byte 9   byte 10  byte 11
xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxx1zz zzzzzzzz 1zzzzzzz 1zzzzzzz 0zzzzzzz

byte 1   byte 2   byte 2   byte 4   byte 5   byte 6   byte 7   byte 8   byte 9   byte 10  byte 11  byte 12
xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxx1zz zzzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz zzzzzzzz
```


### The data section

The data section consists of the encoded root node.


#### Node encodings

The JSON document consists of the following seven node types: (1) root;
(2) object; (3) array; (4) string; (5) number; (6) boolean; (7) null.

Each node type, except the root node, starts with a leading byte, which identifies
the node type and its size.

| Node type         | Hexadecimal       | Binary                      | Description                                     |
|-------------------|-------------------|-----------------------------|-------------------------------------------------|
| uint7             | 0x00 - 0x7F       | 0b0.......                  | Unsigned 7 bit integer.                         |
| obj4              | 0x80 - 0x8F       | 0b1000....                  | Object with up to 15 chunks.                    |
| arr4              | 0x90 - 0x9F       | 0b1001....                  | Array with up to 15 chunks.                     |
| str5              | 0xA0 - 0xBF       | 0b101.....                  | String with up to 31 chunks.                    |
| null              | 0xC0              | 0b11000000                  | "null" value.                                   |
| false             | 0xC2              | 0b11000010                  | "false" value.                                  |
| true              | 0xC3              | 0b11000011                  | "true" value.                                   |
| float32           | 0xCA              | 0b11001010                  | 32-bit floating point number.                   |
| float64           | 0xCB              | 0b11001011                  | 64-bit floating point number.                   |
| uint8             | 0xCC              | 0b11001100                  | Unsigned 8 bit integer.                         |
| uint16            | 0xCD              | 0b11001101                  | Unsigned 16 bit integer.                        |
| uint32            | 0xCE              | 0b11001110                  | Unsigned 32 bit integer.                        |
| uint64            | 0xCF              | 0b11001111                  | Unsigned 64 bit integer (53 bit in JavaScript). |
| int8              | 0xD0              | 0b11010000                  | Signed 8 bit integer.                           |
| int16             | 0xD1              | 0b11010001                  | Signed 16 bit integer.                          |
| int32             | 0xD2              | 0b11010010                  | Signed 32 bit integer.                          |
| int64             | 0xD3              | 0b11010011                  | Signed 64 bit integer (53 bit in JavaScript).   |
| str8              | 0xD9              | 0b11011001                  | String with up to 255 chunks.                   |
| str16             | 0xDA              | 0b11011010                  | String with up to 65,535 chunks.                |
| str32             | 0xDB              | 0b11011011                  | String with up to 4,294,967,295 chunks.         |
| arr16             | 0xDC              | 0b11011100                  | Array with up to 65,535 chunks.                 |
| arr32             | 0xDD              | 0b11011101                  | Array with up to 4,294,967,295 chunks.          |
| obj16             | 0xDE              | 0b11011110                  | Object with up to 65,535 chunks.                |
| obj32             | 0xDF              | 0b11011111                  | Object with up to 4,294,967,295 chunks.         |
| int5              | 0xE0 - 0xFF       | 0b111.....                  | Negative 5 bit integer.                         |

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

1. First byte is set to 0.
2. ID of the object, encoded as a relative ID.
3. Number of keys in the object, encoded as varuint8.
4. A flat list of object fields.

Each object field is encoded as follows:

1. ID of the operation that set this field, encoded as relative ID.
2. The length of field key, encoded as varuint8.
3. The field key, encoded in UTF-8.
4. Value of the field, encoded as a node.


##### Array node encoding

The array node contains the below parts in the following order.

1. First byte is set to 1.
2. ID of the array, encoded as a relative ID.
3. Number chunks in the array, encoded as varuint8.
4. A flat list of chunks.

Each chunk contains the bellow parts in the following order.

1. Number of nodes in the chunk, encoded using bvaruint8.
   1. If bvaruint8 boolean bit is 1, the chunk is considered deleted, there is no
      no contents to follow.
   2. If bvaruint8 boolean bit is 0, the following data contains and ordered flat
      list of nodes, encoded as nodes.


##### String node encoding

The string node contains the below parts in the following order.

1. First byte is set to 2.
2. ID of the string, encoded as a relative ID.
3. Number chunks in the string, encoded as varuint8.
4. A flat list of chunks.

Each chunk contains the bellow parts in the following order.

1. The substring length in the chunk, encoded as bvaruint8.
   1. If bvaruint8 boolean bit is 1, the substring is considered deleted, there
      is no contents to follow. The substring length is used as the length of
      the UTF-8 string that was deleted.
   2. If bvaruint8 boolean bit is 0, the following data contains UTF-8 encoded
      substring, where the length is the length in bytes of the UTF-8 data.


##### Number node encoding

The number node is encoded differently depending on the value of the number.

If the number is a signed integer and can be encoded using one byte, then the
following encoding is used:

1. First byte is set to 10.
2. ID of the number, encoded as a relative ID.
3. ID of the write operation, encoded as a relative ID.
4. The number value, encoded in 1 byte.

If the number is a signed integer and can be encoded using two bytes, then the
following encoding is used:

1. First byte is set to 11.
2. ID of the number, encoded as a relative ID.
3. ID of the write operation, encoded as a relative ID.
4. The number value, encoded in 2 bytes.

If the number is a signed integer and can be encoded using three bytes, then the
following encoding is used:

1. First byte is set to 12.
2. ID of the number, encoded as a relative ID.
3. ID of the write operation, encoded as a relative ID.
4. The number value, encoded in 3 bytes.

If the number is a signed integer and can be encoded using four bytes, then the
following encoding is used:

1. First byte is set to 13.
2. ID of the number, encoded as a relative ID.
3. ID of the write operation, encoded as a relative ID.
4. The number value, encoded in 4 bytes.

If the number is a signed integer and can be encoded using five bytes, then the
following encoding is used:

1. First byte is set to 14.
2. ID of the number, encoded as a relative ID.
3. ID of the write operation, encoded as a relative ID.
4. The number value, encoded in 5 bytes.

If the number is a signed integer and can be encoded using six bytes, then the
following encoding is used:

1. First byte is set to 15.
2. ID of the number, encoded as a relative ID.
3. ID of the write operation, encoded as a relative ID.
4. The number value, encoded in 6 bytes.

If the number can be encoded as 32-bit IEEE 754 floating point number, then the
following encoding is used:

1. First byte is set to 16.
2. ID of the number, encoded as a relative ID.
3. ID of the write operation, encoded as a relative ID.
4. The number value, encoded as 4 bytes IEEE 754 number.

In all other cases the following encoding is used:

1. First byte is set to 3.
2. ID of the number, encoded as a relative ID.
3. ID of the write operation, encoded as a relative ID.
4. The number value stored using 64 bits, encoded as IEEE 754 number.


##### Boolean node encoding

Value `true` is encoded as 1 byte, equal to 4.

Value `false` is encoded as 1 byte, equal to 5.


##### Null node encoding

Value `null` is encoded as 1 byte, equal to 6.


## Encoding components


### Variable length unsigned integer (varuint8)

Variable length unsigned integer is encoded using up to 8 bytes. The maximum
size of the decoded value is 57 bits of data.

The high bit "?" of each byte indicates if the next byte should be consumed, up
to 8 bytes.

```
byte 1   byte 2   byte 3   byte 4   byte 5   byte 6   byte 7   byte 8
?zzzzzzz ?zzzzzzz ?zzzzzzz ?zzzzzzz ?zzzzzzz ?zzzzzzz ?zzzzzzz zzzzzzzz
          11111    2211111  2222222  3333332  4443333  4444444 55555555
 7654321  4321098  1098765  8765432  5432109  2109876  9876543 76543210
   |                        |                    |             |
   5th bit of z             |                    |             |
                            28th bit of z        |             57th bit of z
                                                 39th bit of z
```

Encoding examples:

```
byte 1   byte 2   byte 3   byte 4   byte 5   byte 6   byte 7   byte 8
0zzzzzzz
1zzzzzzz 0zzzzzzz
1zzzzzzz 1zzzzzzz 0zzzzzzz
1zzzzzzz 1zzzzzzz 1zzzzzzz 0zzzzzzz
1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 0zzzzzzz
1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 0zzzzzzz
1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 0zzzzzzz
1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz zzzzzzzz
```


### Boolean variable length unsigned integer (bvaruint8)

Boolean variable length unsigned integer (bvaruint8) is encoded in a similar way
to varuint8, but the first bit x is used for storing a boolean value.

bvaruint8 is encoded using up to 8 bytes. Because the first bit is used to store
a boolean value, the maximum data bvaruint8can hold is 56 bits.

```
byte 1   byte 2   byte 3   byte 4   byte 5   byte 6   byte 7   byte 8
x?zzzzzz ?zzzzzzz ?zzzzzzz ?zzzzzzz ?zzzzzzz ?zzzzzzz ?zzzzzzz zzzzzzzz
|         11111    2111111  2222222  3333322  4433333  4444444 55555554
| 654321  3210987  0987654  7654321  4321098  1098765  8765432 65432109
|  |                        |                    |             |
|  5th bit of z             |                    |             |
|                           27th bit of z        |             56th bit of z
|                                                38th bit of z
x stores a boolean value
```

Encoding examples:

```
byte 1   byte 2   byte 3   byte 4   byte 5   byte 6   byte 7   byte 8
x0zzzzzz
x1zzzzzz 0zzzzzzz
x1zzzzzz 1zzzzzzz 0zzzzzzz
x1zzzzzz 1zzzzzzz 1zzzzzzz 0zzzzzzz
x1zzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 0zzzzzzz
x1zzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 0zzzzzzz
x1zzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 0zzzzzzz
x1zzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz zzzzzzzz
```


### Relative ID

Each *relative ID* encodes a way to decode an absolute ID using the vector clock
table.

Absolute ID is a specific value of a logical clock. And ID consists of a
(1) session ID and (2) time sequence pair.

Each relative ID is a 2-tuple.

1. The first element is the index in the vector
   clock table. For example, 0 means "the first logic clock" in the vector clock
   table, or 3 means "the fourth logical clock" in the vector clock table.
2. The second element encodes the difference of the time value of the time of
   the clock in the vector table and the absolute ID time. For example of the
   time of the clock X in the clock table is 10, and the encoded time difference
   is 2, the time of the absolute ID is 10 - 2 = 8.

In the below encoding diagrams bits are annotated as follows:

- "x" - vector table index, reference to the logical clock.
- "z" - time difference.
- "?" - whether the next byte is used for encoding.

If x is less than 8 and z is less than 16, the relative ID is encoded as a
single byte:

```
byte 1
0xxxzzzz
```

Otherwise the top bit of the first byte is set to 1. And subsequently x and "?"
are encoded separately as variable length unsigned integers. Where x loses the
ability to encode the highest bit of the first byte.

x is encoded using up to 4 bytes. The maximum size of x is a 28-bit
unsigned integer. x is encoded using variable length encoding, if "?" is set to 1
the next byte should be consumed to decode x.

```
byte 1   byte 2   byte 3   byte 4
1?xxxxxx ?xxxxxxx ?xxxxxxx xxxxxxxx
          1111     2111111 22222222
  654321  3210987  0987654 87654321
   |                       |
   5th bit of x            |
                           28th bit of x
```

x encoding examples:

```
byte 1   byte 2   byte 3   byte 4
10xxxxxx
11xxxxxx 0xxxxxxx
11xxxxxx 1xxxxxxx 0xxxxxxx
11xxxxxx 1xxxxxxx 1xxxxxxx xxxxxxxx
```

z is encoded using up to 6 bytes. The maximum size of z is a 39-bit
unsigned integer. z is encoded using variable length encoding, if z is set to 1
the next byte should be consumed to decode z.

```
byte 1   byte 2   byte 3   byte 4   byte 5   byte 6
?zzzzzzz ?zzzzzzz ?zzzzzzz ?zzzzzzz ?zzzzzzz ....zzzz
          11111    2211111  2222222  3333332     3333
 7654321  4321098  1098765  8765432  5432109     9876
   |                        |                    |
   5th bit of z             |                    |
                            28th bit of z        |
                                                 39th bit of z
```

"?" encoding examples:

```
byte 1   byte 2   byte 3   byte 4   byte 5   byte 6
0zzzzzzz
1zzzzzzz 0zzzzzzz
1zzzzzzz 1zzzzzzz 0zzzzzzz
1zzzzzzz 1zzzzzzz 1zzzzzzz 0zzzzzzz
1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 0zzzzzzz
1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 1zzzzzzz 0000zzzz
```
