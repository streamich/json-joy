Makes a plain Codemirror editor instance collaborative by binding it to a JSON CRDT
document `str` node. This allows multiple users to edit the same document
json-joy JSON CRDT document concurrently through the Codemirror editor.


## Usage

Installation:

```
npm install json-joy codemirror collaborative-codemirror
```

Usage:

```ts
import {EditorView} from 'codemirror';
import {bind} from 'collaborative-codemirror';
import {Model, s} from 'json-joy/lib/json-crdt';

// Create a JSON CRDT model.
const model = Model.create(s.str(''));

// Create a Code Mirror editor instance.
const editor = new EditorView({parent: div});

// Connect Code Mirror editor to JSON CRDT document "str" node.
const unbind = bind(model.s.toApi(), editor);

// When done, unbind the binding.
binding.unbind();
```


## Preview

See [demo](https://streamich.github.io/collaborative-codemirror).
