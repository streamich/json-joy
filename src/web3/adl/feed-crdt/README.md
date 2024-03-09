# Feed CRDT

Feed CRDT is an infinite length sorted list of entries. It supports only
*insert* and *delete* operations. A user can append a new entry to the end of
the list (insert), or delete an existing entry from the list.


## IPLD Schema

```ipld
type FeedBlock struct {
  inserts [FeedInsertOp]
  deletes [String]
  seq Integer
  prev Link
} representation tuple

type FeedInsertOp struct {
  value String
  id Hlc
} representation tuple

type Hlc struct {
  time Integer
  seq Integer
  node Integer
} representation tuple
```
