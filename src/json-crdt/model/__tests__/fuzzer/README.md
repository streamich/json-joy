# Fuzz Testing of JSON CRDT Model

`SessionLogical` implements fuzzing for JSON CRDT model with logical vector
clock. Some number of peers generate random number of patches, each patch
has random number of operations, executed on random JSON CRDT nodes.
Then all patches from all peers are merged in different order and we
check that all peers arrive at the same state. That finishes one
*editing session*, which is then repeated.
