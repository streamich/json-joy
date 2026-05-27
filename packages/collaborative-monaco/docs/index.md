Makes a plain Monaco editor instance collaborative by binding it to a JSON CRDT
document `str` node. This allows multiple users to edit the same document
json-joy JSON CRDT document concurrently through the Monaco editor.


## Usage

Installation:

```
npm install json-joy monaco-editor collaborative-monaco
```

Usage:

```ts
import {bind} from 'collaborative-monaco';
import * as monaco from 'monaco-editor';
import {Model} from 'json-joy/lib/json-crdt';

const model = Model.create(s.str('hello'));

const editor = monaco.editor.create(div, {
  value: 'hello world',
});

const unbind = bind(model.s.toApi(), editor);

// When done, unbind the binding.
binding.unbind();
```


## Usage with React

Installation:

```
npm install json-joy monaco-editor collaborative-monaco @monaco-editor/react react react-dom
```

Usage:

```tsx
import {Model, s} from 'json-joy/lib/json-crdt';
import {CollaborativeMonaco} from 'collaborative-monaco/lib/CollaborativeMonaco';

const model = Model.create(s.str('hello'));

const MyComponent = () => {
  return <CollaborativeMonaco str={model.s.toApi()} />
};
```


## Preview

See [demo](https://streamich.github.io/collaborative-monaco).
