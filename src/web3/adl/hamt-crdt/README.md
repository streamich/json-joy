# HAMT CRDT

HAMT CRDT is an infinitely scalable key-value store that is implemented using as
a HAMT data structure as a CRDT. Each HAMT node stores up to 16 *key-value-time*
3-tuple entries and up to 17 links to child nodes.

It supports only a single `.put()` operation. To delete a key, one puts an
`undefined` value. Each operation is accompanied by an ID (timestamp), expressed
as hybrid logical clock (HLC) value. Each key is a single value LWW register,
where the HLC clock is used for determining the winner.
