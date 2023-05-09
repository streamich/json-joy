# JSON CRDT Clocks

In principle JSON CRDT uses logical timestamps as IDs for everything
in the CRDT structure and also to identify JSON CRDT Patch operations.
A logical time stamp is a `[sessionId, time]` 2-tuple.

`sessionId` is a randomly generated 53-bit unsigned integer which
uniquely identifies every editing session, i.e. every browser tab.
The `time` component is a monotonically increasing integer, which
starts from 0.

JSON CRDT can also work with "sever timestamps", server timestamps
are similar to logical timestamps, but the `sessionId` is always
set to the constant 1. We can use this simplification when all
CRDT operations go through the central server, which sequentially
orders and assigns the final `time` to each operation.
