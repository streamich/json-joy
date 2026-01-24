# Ace Editor Collaborative Editing Binding

Makes a plain Ace editor instance collaborative by binding it to a JSON CRDT
document `str` node. This allows multiple users to edit the same document
json-joy JSON CRDT document concurrently through the Ace editor.


## Usage

Installation:

```
npm install json-joy @jsonjoy.com/collaborative-ace ace-builds
```

Usage:

```ts
import {bind} from '@jsonjoy.com/collaborative-ace';
import {Model} from 'json-joy/lib/json-crdt';

// ...

const unbind = bind(() => str, editor);

// When done, unbind the binding.
unbind();
```


## React

For React usage, see the [`@jsonjoy.com/collaborative-ace-react`](https://www.npmjs.com/package/@jsonjoy.com/collaborative-ace-react) package.
