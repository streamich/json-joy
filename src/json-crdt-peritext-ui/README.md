# Peritext UI

## Controller Events

### Editing

- Events
  - [ ] `insert` event
    - [ ] Insert a character.
    - [ ] Insert a string.
  - [ ] `delete` event
    - [ ] Delete one character backward.
    - [ ] Delete one character forward.
  - [ ] `mark` event
    - [ ] Annotate range.
    - [ ] Insert block split.
  - [ ] `mark-update` event
    - [ ] Change annotation metadata.
    - [ ] Change annotation range.
    - [ ] Change block metadata.
  - [ ] `mark-delete` event
    - [ ] Delete block split.
    - [ ] Delete annotation.
- Imperative
  - [ ] Delete range.
  - [ ] Delete all annotations in range.
  - [ ] Find block by position.
  - [ ] Find annotations by position.
  - [ ] Get block range.

### Selection

- Events
  - `select` event
    - [ ] Set caret.
    - [ ] Set selection.
  - `select-all`
    - [ ] Select all.
  - `select-object`
    - [ ] Select block.
    - [ ] Select word.
  - `update-selection`
    - [ ] Change position of left or right end of selection.
- Imperative

### Navigation

- [ ] Move one character left.
- [ ] Move one character right.
- [ ] Move one word left.
- [ ] Move one word right.
- [ ] Move left until end of line.
- [ ] Move right until end of line.
- [ ] Move up one line.
- [ ] Move down one line.

### Clipboard

- [ ] Export range.
- [ ] Import range.
- [ ] Insert plain text.
- [ ] Insert HTML.

### History

- [ ] Undo.
- [ ] Redo.

### Overlays

- [ ] Insert an overlay.
- [ ] Update overlay metadata.
- [ ] Delete an overlay.
- [ ] Change overlay range.
- [ ] Assign a set of overlays.
- [ ] Remove an overlay set.
