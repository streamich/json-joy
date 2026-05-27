## Collaborative Quill binding

Makes a [Quill](https://quilljs.com/) rich-text editor collaborative by binding
it to a JSON CRDT `quill-delta` node, so multiple users can edit the same
document concurrently. Unlike the other rich-text bindings, Quill maps to the
`quill-delta` node rather than Peritext.


## Installation

```
npm install @jsonjoy.com/collaborative-quill json-joy quill quill-delta
```


## Usage

Bind the Quill instance to the document's `quill-delta` node. `bind` returns an
`unbind` cleanup function:

```ts
import {bind} from '@jsonjoy.com/collaborative-quill';

// The first argument returns the QuillDeltaApi node from your json-joy model.
const unbind = bind(() => quillDeltaApi, quill);

// When done:
unbind();
```


## React

For React components, see
[`@jsonjoy.com/collaborative-quill-react`](https://github.com/streamich/json-joy/tree/master/packages/collaborative-quill-react).
