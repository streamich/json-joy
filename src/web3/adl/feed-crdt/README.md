# Feed CRDT

Feed CRDT is an infinite length sorted list of entries. It supports only
*insert* and *delete* operations. A user can append a new entry to the end of
the list (insert), or delete an existing entry from the list.

Entries are stored in *frames*. The feed is represented as a linked list of
frames. Each frame stores one or more operations. There are insert and delete
operations. Each operation is identified by a hybrid logical clock (HLC)
timestamp.
