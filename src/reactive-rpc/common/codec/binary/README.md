# `binary` codec for Reactive-RPC messages

`binary` codec specifies a binary encoding format for Reactive-RPC protocol
messages.


## Message encoding

- All messages are at least 4 bytes long.

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

Variable number of bytes:
+========+
|        |
+========+
```


### Notification Message

The Notification message consists of:

1. Leading `000` represents the message type.
1. `x` encodes the size of the payload `data`.
1. `z` encodes method `name` as unsigned 8-bit integer.
1. Remote method `name` string, encoded as ASCII text.
1. Binary payload `data`.

The Notification message has only this form:

```
+--------+--------+--------+--------+========+========+
|000xxxxx|xxxxxxxx|xxxxxxxx|zzzzzzzz|  name  |  data  |
+--------+--------+--------+--------+========+========+
```

- The maximum size of the payload `data` is 2 ** 23 - 1 bytes (~2MB).


### Message with payload and name encoding

A message with payload and name consists of:

1. Leading bits `iii` represent the message type.
1. `x` encodes the size of the payload `data`.
1. `y` encodes the channel/subscription sequence number.
1. `z` encodes method `name` as unsigned 8-bit integer.
1. Remote method `name` string, encoded as ASCII text.
1. Binary payload `data`.
1. `?` is a bit flag which determines if the following byte should be used for
  decoding a variable length integer.

General message structure:

```
+--------+--------+--------+--------+--------+========+========+........+........+
|iii?xxxx|xxxxxxxx|?xyxyxyx|xyxyxyxy|zzzzzzzz|  name  |  data  |yyyyyyyy|yyyyyyyy|
+--------+--------+--------+--------+--------+========+========+........+........+
```

Encoding depends on the size of `data`:

```
if x <= 0b1111_11111111 (4095 ~ 4KB):
+--------+--------+--------+--------+--------+========+========+
|iii0xxxx|xxxxxxxx|yyyyyyyy|yyyyyyyy|zzzzzzzz|  name  |  data  |
+--------+--------+--------+--------+--------+========+========+

if x <= 0b1111_11111111_1111111 (524287 ~ 512KB):
+--------+--------+--------+--------+--------+========+========+--------+
|iii1xxxx|xxxxxxxx|0xxxxxxx|yyyyyyyy|zzzzzzzz|  name  |  data  |yyyyyyyy|
+--------+--------+--------+--------+--------+========+========+--------+

if x > 0b1111_11111111_1111111 (524287)
  and x <= 0b1111_11111111_1111111_11111111 (134217727 ~ 128MB):
+--------+--------+--------+--------+--------+========+========+--------+--------+
|iii1xxxx|xxxxxxxx|1xxxxxxx|xxxxxxxx|zzzzzzzz|  name  |  data  |yyyyyyyy|yyyyyyyy|
+--------+--------+--------+--------+--------+========+========+--------+--------+
```


### Message with payload-only encoding

A message with payload-only consists of:

1. Leading bits `iii` represent the message type.
1. `x` encodes the size of the payload `data`.
1. `y` encodes the channel/subscription sequence number.
1. Binary payload `data`.
1. `?` is a bit flag which determines if the following byte should be used for
  decoding a variable length integer.

General message structure:

```
+--------+--------+--------+--------+========+........+........+
|iii?xxxx|xxxxxxxx|?xyxyxyx|xyxyxyxy|  data  |yyyyyyyy|yyyyyyyy|
+--------+--------+--------+--------+========+........+........+
```

Encoding depends on the size of `data`:

```
if x <= 0b1111_11111111 (4095 ~ 4KB):
+--------+--------+--------+--------+========+
|iii0xxxx|xxxxxxxx|yyyyyyyy|yyyyyyyy|  data  |
+--------+--------+--------+--------+========+

if x <= 0b1111_11111111_1111111 (524287 ~ 512KB):
+--------+--------+--------+--------+========+--------+
|iii1xxxx|xxxxxxxx|0xxxxxxx|yyyyyyyy|  data  |yyyyyyyy|
+--------+--------+--------+--------+========+--------+

if x > 0b1111_11111111_1111111 (524287)
  and x <= 0b1111_11111111_1111111_11111111 (134217727 ~ 128MB):
+--------+--------+--------+--------+========+--------+--------+
|iii1xxxx|xxxxxxxx|1xxxxxxx|xxxxxxxx|  data  |yyyyyyyy|yyyyyyyy|
+--------+--------+--------+--------+========+--------+--------+
```


### Request Data Message

The *Request Data Message* is encoded as a message with payload and name with
`001` set as the leading bits.


### Request Complete Message

The *Request Data Message* is encoded as a message with payload and name with
`010` set as the leading bits.


### Request Error Message

The *Request Error Message* is encoded as a message with payload-only with
`011` set as the leading bits.


### Request Un-subscribe Message

The *Request Un-subscribe Message* message consists of:

1. Leading `111` represents the control message type.
1. Second byte `00000000` indicates that it is a *Request Un-subscribe Message*.
1. `y` encodes the channel/subscription sequence number.

```
+--------+--------+--------+--------+
|11100000|00000000|yyyyyyyy|yyyyyyyy|
+--------+--------+--------+--------+
```


### Response Data Message

The *Response Data Message* is encoded as a message with payload-only with
`100` set as the leading bits.


### Response Complete Message

The *Response Complete Message* is encoded as a message with payload-only with
`101` set as the leading bits.


### Response Error Message

The *Response Complete Message* is encoded as a message with payload-only with
`110` set as the leading bits.


### Response Un-subscribe Message

The *Response Un-subscribe Message* message consists of:

1. Leading `111` represents the control message type.
1. Second byte `00000001` indicates that it is a *Response Un-subscribe Message*.
1. `y` encodes the channel/subscription sequence number.

```
+--------+--------+--------+--------+
|11100000|00000001|yyyyyyyy|yyyyyyyy|
+--------+--------+--------+--------+
```


### The channel/subscription sequence number `y`

The `y` sequence number uniquely identifies an *active ID* (a request/response in-flight
or an active subscription). It is chosen to be encoded as 2 bytes as a compromise
between: (1) it should consume as little bytes on the wire as possible; (2) it
should be big enough to be able to support a reasonable number of active IDs for
a typical server-client application.

The `id` field typically starts from 0, and for each new subscribe message the
client increments it by one. Once the `id` reaches 65535, it is reset back to
zero.

Both, client and server, know the set of active IDs.

The client must check for all currently active IDs when generating a new ID, if
the generated ID collides with an already active ID, the client must skip that
ID and try the next one.

If the server receives a new subscribe message with ID which collides with an
active ID, it should stop processing and purge the existing subscription with
that ID and then process the new subscribe message with that ID as usual.
