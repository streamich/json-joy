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


## The notification message

Notification message consists of:

1. Remote `method` name string, encoded as ASCII text.
2. Optional binary payload `data`.

```
+--------+........+--------+........+========+========+
|000?xxxx|?xxxxxxx|?yyyyyyy|?yyyyyyy| method |  data  |
+--------+........+--------+........+========+========+
```

- `?` is a bit flag which determines if the following byte should be used for
  decoding a variable length integer.
- `x` is a variable length unsigned integer that encodes total length of the
  message.
- `y` is a variable length unsigned integer that encodes the length of the
  `method` field.


## The subscribe message

Subscribe message consists of:

1. Subscription `id`, encoded as unsigned 16 bit integer.
2. Remote `method` name string, encoded as ASCII text.
3. Optional binary payload `data`.

```
+--------+........+--------+--------+--------+........+========+========+
|001?xxxx|?xxxxxxx|        id       |?yyyyyyy|?yyyyyyy| method |  data  |
+--------+........+--------+--------+--------+........+========+========+
```

- `?` is a bit flag which determines if the following byte should be used for
  decoding a variable length integer.
- `x` is a variable length unsigned integer that encodes total length of the
  message.
- `y` is a variable length unsigned integer that encodes the length of the
  `method` field.


## The data message

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
- `x` is a variable length unsigned integer that encodes length of `data`.


## The complete message

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
- `x` is a variable length unsigned integer that encodes length of `data`.


## The un-subscribe message

Un-subscribe message consists of:

1. Subscription `id`, encoded as unsigned 16 bit integer.

```
+--------+--------+--------+
|10000000|        id       |
+--------+--------+--------+
```


## The error message

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
- `x` is a variable length unsigned integer that encodes length of `data`.
