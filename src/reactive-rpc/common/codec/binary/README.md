# `binary` codec for Reactive-RPC messages

`binary` codec specifies a binary encoding format for Reactive-RPC protocol
messages.

| First byte (in binary)        | Message                                      | Has payload       |
|-------------------------------|----------------------------------------------|-------------------|
| `000?xxxx`                    | Request Data Message                         | Yes               |
| `001?xxxx`                    | Request Complete Message                     | Maybe             |
| `010?xxxx`                    | Request Error Message                        | Yes               |
| `011?xxxx`                    | Notification Message                         | Maybe             |
| `100?xxxx`                    | Response Data Message                        | Yes               |
| `101?xxxx`                    | Response Complete Message                    | Maybe             |
| `110?xxxx`                    | Response Error Message                       | Yes               |
| `11100001` to `11111101`      | Reserved                                     |                   |
| `11111110`                    | Request Un-subscribe Message                 | No                |
| `11111111`                    | Response Un-subscribe Message                | No                |

Where `?` is a bit flat which determines if the next byte should be read to
determine the message length. And `x` are first 4 bits of the payload length.


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

Variable number of bytes:
+========+
|        |
+========+
```


### Notification Message

Notification message consists of:

1. Remote `method` name string, encoded as ASCII text. Preceded with a method
  `size` byte, encoded as unsigned integer.
2. Optional binary payload `data`.

```
+--------+........+--------+========+========+
|011?xxxx|?xxxxxxx|  size  | method |  data  |
+--------+........+--------+========+========+
```

- `?` is a bit flag which determines if the following byte should be used for
  decoding a variable length integer.
- `x` is a variable length unsigned integer that encodes `data` size.


### Request Data Message

*Request Data Message* consists of:

1. Subscription `id`, encoded as unsigned 16 bit integer.
2. Method name `size` byte, encoded as unsigned integer.
3. Remote `method` name string, encoded as ASCII text.
4. Binary payload `data`.

```
+--------+........+--------+--------+--------+========+========+
|000?xxxx|?xxxxxxx|        id       |  size  | method |  data  |
+--------+........+--------+--------+--------+========+========+
```

- `?` is a bit flag which determines if the following byte should be used for
  decoding a variable length integer.
- `x` is a variable length unsigned integer that encodes `data` size.
- When `method` is known from subscription `id`, `size` is set to 0.


### Request Complete Message

*Request Complete Message* consists of:

1. Subscription `id`, encoded as unsigned 16 bit integer.
2. Method name `size` byte, encoded as unsigned integer.
3. Remote `method` name string, encoded as ASCII text.
4. Optional binary payload `data`.

```
+--------+........+--------+--------+--------+========+========+
|001?xxxx|?xxxxxxx|        id       |  size  | method |  data  |
+--------+........+--------+--------+--------+========+========+
```

- `?` is a bit flag which determines if the following byte should be used for
  decoding a variable length integer.
- `x` is a variable length unsigned integer that encodes `data` size.
- When `method` is known from subscription `id`, `size` is set to 0.


### Request Error Message

*Request Error Message* consists of:

1. Subscription `id`, encoded as unsigned 16 bit integer.
2. Method name `size` byte, encoded as unsigned integer.
3. Remote `method` name string, encoded as ASCII text.
4. Optional binary payload `data`.

```
+--------+........+--------+--------+--------+========+========+
|010?xxxx|?xxxxxxx|        id       |  size  | method |  data  |
+--------+........+--------+--------+--------+========+========+
```

- `?` is a bit flag which determines if the following byte should be used for
  decoding a variable length integer.
- `x` is a variable length unsigned integer that encodes `data` size.
- When `method` is known from subscription `id`, `size` is set to 0.


### Request Un-subscribe Message

*Request Un-subscribe Message* message consists of:

1. Subscription `id`, encoded as unsigned 16 bit integer.

```
+--------+--------+--------+
|11111110|        id       |
+--------+--------+--------+
```


### Response Data Message

*Response Data Message* consists of:

1. Subscription `id`, encoded as unsigned 16 bit integer.
2. Required binary payload `data`.

```
+--------+........+--------+--------+========+
|100?xxxx|?xxxxxxx|        id       |  data  |
+--------+........+--------+--------+========+
```

- `?` is a bit flag which determines if the following byte should be used for
  decoding a variable length integer.
- `x` is a variable length unsigned integer that encodes `data` size.


### Response Complete Message

*Response Complete Message* consists of:

1. Subscription `id`, encoded as unsigned 16 bit integer.
2. Optional binary payload `data`.

```
+--------+........+--------+--------+========+
|101?xxxx|?xxxxxxx|        id       |  data  |
+--------+........+--------+--------+========+
```

- `?` is a bit flag which determines if the following byte should be used for
  decoding a variable length integer.
- `x` is a variable length unsigned integer that encodes `data` size.


### Response Error Message

*Response Error Message* consists of:

1. Subscription `id`, encoded as unsigned 16 bit integer.
2. Required binary payload `data`.

```
+--------+........+--------+--------+========+
|110?xxxx|?xxxxxxx|        id       |  data  |
+--------+........+--------+--------+========+
```

- `?` is a bit flag which determines if the following byte should be used for
  decoding a variable length integer.
- `x` is a variable length unsigned integer that encodes `data` size.


### Response Un-subscribe Message

*Response Un-subscribe Message* consists of:

1. Subscription `id`, encoded as unsigned 16 bit integer.

```
+--------+--------+--------+
|11111111|        id       |
+--------+--------+--------+
```


## Operational behavior

...


### Header length

The maximum length of header size encoding `x` is 4 bytes.

For example, the maximum length of the notification message header is 4 bytes:

```
+--------+--------+--------+--------+--------+========+========+
|0001xxxx|1xxxxxxx|1xxxxxxx|xxxxxxxx|  size  | method |  data  |
+--------+--------+--------+--------+--------+========+========+
```

Thi allows the maximum of 26 to represent `x`, which means the maximum `data`
size of a single message is 67,108,864 bytes (or 64 MB).


### The `id` field

The `id` field uniquely identifies an *active ID* (a request/response in-flight
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
