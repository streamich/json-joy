# Fuzz Testing of JSON CRDT Model

`SessionLogical` implements fuzzing for JSON CRDT model with logical vector
clock. Some number of peers generate random number of patches, each patch
has random number of operations, executed on random JSON CRDT nodes.
Then all patches from all peers are merged in different order and we
check that all peers arrive at the same state. That finishes one
_editing session_, which is then repeated.

The `SessionServer` implements fuzz testing for a model with server clock,
however, since the operations are ordered by the server anyways, it does
not test much, but it does test all codecs (for state and patches) of
serialization and de-serialization of a model with server clock.
