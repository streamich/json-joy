# Extensions

Extensions allow to create new node types out of the existing built-in types:
`con`, `val`, `obj`, `vec`, `str`, `bin`, `arr`.

Each extension has a globally unique ID, which is an 8-bit unsigned integer.
Thus, only 256 extensions can be defined at the same time.

Extensions do not modify in any shape the JSON CRDT, nor JSON CRDT Patch
protocols, instead they build on top of the `vec` node type. An extension node
is a `vec` node with a specific structure, and a specific interpretation of the
elements of the `vec` node.

An extension `vec` node follows the following structure: it is a 2-tuple, where
the first element in the extension _header_ and the second element is the
extension _payload_.

The extension _header_ is a `con` node, which holds a 3 byte `Uint8Array` with
the following octets: (1) the extension ID, (2) the session ID modulo 256, and
(3) the time sequence modulo 256.

The extension _payload_ is any JSON CRDT node with any value, which is specific
to the extension.

```
vec
├─ 0: con Uin8Array { <ext_id>, <sid_mod_256>, <time_mod_256> }
└─ 1: any
```
