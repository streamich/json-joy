# Collaborative plain text editor binding

This package provides binding for a generic text editor to a [JSON CRDT `str` node](https://jsonjoy.com/specs/json-crdt/model-document/node-types#The-str-RGA-String-Node-Type).

![collaborative-editor](https://github.com/user-attachments/assets/7d1c2158-5890-4e73-8aa8-bc929e9135f8)


## Usage

Installation:

```
npm install json-joy @jsonjoy.com/collaborative-editor
```

Simple integration for any plain text editor, for the most basic integration
you only need to implement the `.get()` and `.set()` methods:

```ts
import {StrBinding, EditorFacade} from '@jsonjoy.com/collaborative-editor';
import {Model} from 'json-joy/lib/json-crdt';

const str = model.api.str(['path', 'to', 'string']);
const unbind = StrBinding.bind(str, {
  get: () => input.value,
  set: (value: string) => input.value = value,
}, true);
```

For a better integration, implement as many `EditorFacade` methods as possible:

```ts
import {StrBinding, EditorFacade} from '@jsonjoy.com/collaborative-editor';

const editor: EditorFacade = {
  // ...
};

const str = model.api.str(['path', 'to', 'string']);
const binding = new StrBinding(str, editor);

binding.syncFromModel();
binding.bind(polling);

// When done, unbind the binding.
binding.unbind();
```
