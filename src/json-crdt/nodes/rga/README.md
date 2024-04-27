# Block-wise Replicated Growable Array (RGA) Tree Split

This is a block-wise RGA tree with split links implementation. Two trees index
by (1) ID and by (2) position are used to keep track of the elements.

This abstract RGA implementation is used to implement all list-like data
structure:

- String
- Binary blob
- Array

References:

- https://pages.lip6.fr/Marc.Shapiro/papers/rgasplit-group2016-11.pdf

## Data structures

All text data is stored in chunks (blocks in RGA lingo).

Two chunks are ordered using two trees:

- Spacial, contains the elements are they should be sorted in the RGA.
  - Each chunk also aggregates the length of the view below it.
  - Fancy middle-of-chunk insert is used from the "High Responsiveness for Group
    Editing CRDTs" paper. That seems to boost performance.
  - Recently accessed chunks moved up in the tree.
  - Other than that the tree is not-rebalanced, but when it is cloned or
    un-serialized it is loaded in a balanced form.
  - Adjacent logical clock blocks are re-combined into a single chunk, both,
    visible chunks and tombstones.
- Another, temporal, tree which is sorted by chunk IDs.
