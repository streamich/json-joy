# CapacityEstimatorCodegen

A JIT code generator, which compiles an efficient buffer size estimator given a
JSON Type schema. The estimator efficiently computes the minimum buffer size
required to serialize a given JSON-like value to any JSON-like encoding format,
such as JSON, CBOR, or MessagePack. It overestimates the size to ensure that
the buffer is always large enough for all possible values of the type and all
possible encoding formats.
