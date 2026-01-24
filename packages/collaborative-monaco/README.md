# Collaborative editing for Monaco editor

Makes a plain Monaco editor instance collaborative by binding it to a JSON CRDT
document `str` node. This allows multiple users to edit the same document
json-joy JSON CRDT document concurrently through the Monaco editor.


## Usage

Installation:

```
npm install json-joy @jsonjoy.com/collaborative-monaco monaco-editor
```

Usage:

```ts
import {bind} from '@jsonjoy.com/collaborative-monaco';
import * as monaco from 'monaco-editor';
import {Model, s} from 'json-joy/lib/json-crdt';

const model = Model.create(s.str('hello'));

const editor = monaco.editor.create(div, {
  value: 'hello world',
});

const unbind = bind(() => model.s.toApi(), editor);

// When done, unbind the binding.
unbind();
```


## React Usage

Installation:

```
npm install json-joy @jsonjoy.com/collaborative-monaco monaco-editor @monaco-editor/react react react-dom
```

Usage:

```tsx
import {Model, s} from 'json-joy/lib/json-crdt';
import {CollaborativeMonaco} from '@jsonjoy.com/collaborative-monaco/lib/CollaborativeMonaco';

const model = Model.create(s.str('hello'));

const MyComponent = () => {
  return <CollaborativeMonaco str={model.s.toApi()} />
};
```
