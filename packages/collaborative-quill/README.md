# Quill editor collaborative editing binding

Makes a rich-text Quill editor instance collaborative by binding it to a JSON CRDT
document using the `quill` extension. This allows multiple users to edit the
same document json-joy JSON CRDT document concurrently through the Quill editor.


## Usage

Installation:

```
npm install @jsonjoy.com/collaborative-quill json-joy quill quill-delta
```

Usage:

```ts
import {bind} from '@jsonjoy.com/collaborative-quill';
import {Model} from 'json-joy/lib/json-crdt';

// ...

const unbind = bind(str, editor);

// When done, unbind the binding.
unbind();
```


## React

For React components, see [`@jsonjoy.com/collaborative-quill-react`](../collaborative-quill-react).


## Preview

- See [demo](https://streamich.github.io/collaborative-quill).
