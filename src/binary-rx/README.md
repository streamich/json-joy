# Binary-Rx

Binary-Rx specifies a binary encoding format for JSON-Rx protocol. Semantically
Binary-Rx is exactly the same as JSON-Rx, so it supports: (1) notifications,
(2) request/response; (3) subscriptions. Syntactically this documents specifies
a binary encoding format for every JSON-Rx message type.

| First byte | Message |
|-|-|
| `000?xxxx` | Notification message |
| `001?xxxx` | Subscribe message |
| `010?xxxx` | Data message |
| `011?xxxx` | Complete message |
| `10000000` | Un-subscribe message |
| `101?xxxx` | Error message |
| `11000000` to `11111111` | Reserved |
| `10000001` to `10011111` | Reserved |



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


### The notification message

Notification message consists of:

1. Remote `method` name string, encoded as ASCII text. Preceded with a method
  `size` byte, encoded as unsigned integer.
2. Optional binary payload `data`.

```
+--------+........+--------+========+========+
|000?xxxx|?xxxxxxx|  size  | method |  data  |
+--------+........+--------+========+========+
```

- `?` is a bit flag which determines if the following byte should be used for
  decoding a variable length integer.
- `x` is a variable length unsigned integer that encodes `data` size.


### The subscribe message

Subscribe message consists of:

1. Subscription `id`, encoded as unsigned 16 bit integer. Preceded with a method
  `size` byte, encoded as unsigned integer.
2. Remote `method` name string, encoded as ASCII text.
3. Optional binary payload `data`.

```
+--------+........+--------+--------+--------+========+========+
|001?xxxx|?xxxxxxx|        id       |  size  | method |  data  |
+--------+........+--------+--------+--------+========+========+
```

- `?` is a bit flag which determines if the following byte should be used for
  decoding a variable length integer.
- `x` is a variable length unsigned integer that encodes `data` size.


### The data message

Data message consists of:

1. Subscription `id`, encoded as unsigned 16 bit integer.
2. Required binary payload `data`.

```
+--------+........+--------+--------+========+
|010?xxxx|?xxxxxxx|        id       |  data  |
+--------+........+--------+--------+========+
```

- `?` is a bit flag which determines if the following byte should be used for
  decoding a variable length integer.
- `x` is a variable length unsigned integer that encodes `data` size.


### The complete message

Complete message consists of:

1. Subscription `id`, encoded as unsigned 16 bit integer.
2. Optional binary payload `data`.

```
+--------+........+--------+--------+========+
|011?xxxx|?xxxxxxx|        id       |  data  |
+--------+........+--------+--------+========+
```

- `?` is a bit flag which determines if the following byte should be used for
  decoding a variable length integer.
- `x` is a variable length unsigned integer that encodes `data` size.


### The un-subscribe message

Un-subscribe message consists of:

1. Subscription `id`, encoded as unsigned 16 bit integer.

```
+--------+--------+--------+
|10000000|        id       |
+--------+--------+--------+
```


### The error message

Error message consists of:

1. Subscription `id`, encoded as unsigned 16 bit integer.
2. Required binary payload `data`.

```
+--------+........+--------+--------+========+
|101?xxxx|?xxxxxxx|        id       |  data  |
+--------+........+--------+--------+========+
```

- `?` is a bit flag which determines if the following byte should be used for
  decoding a variable length integer.
- `x` is a variable length unsigned integer that encodes `data` size.


## Operational behavior

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
