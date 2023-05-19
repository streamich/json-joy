# Block-wise Replicated Growable Array (RGA) Tree Split

Details:

- Uses a binary splay tree to store chunks in order of the final view.
- It uses the *insert int the middle* of chunk operation, as described in
  Briot et. al (2016).
- *Split link* references are used to iterate through items for deletion.
- Two views of the chunks are maintained: (1) spacial (sorted in order of text
  position), and (2) temporal (sorted in order of operation IDs).

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
