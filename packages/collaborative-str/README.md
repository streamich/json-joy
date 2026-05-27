# Collaborative plain text editor binding

Binds a generic plain text editor to a [JSON CRDT `str` node](https://jsonjoy.com/specs/json-crdt/model-document/node-types#The-str-RGA-String-Node-Type),
enabling real-time collaborative editing of `<input>`, `<textarea>`, and code
editors like CodeMirror, Monaco, and Ace.

📖 **[Full documentation →](https://jsonjoy.com/libs/collaborative-str)**

![collaborative-str](https://github.com/user-attachments/assets/7d1c2158-5890-4e73-8aa8-bc929e9135f8)


## Installation

```
npm install json-joy @jsonjoy.com/collaborative-str
```


## Usage

The minimal integration implements only `get()` and `set()`:

```ts
import {StrBinding} from '@jsonjoy.com/collaborative-str';

const unbind = StrBinding.bind(
  () => model.api.str(['path', 'to', 'string']),
  {
    get: () => input.value,
    set: (text) => { input.value = text; },
  },
  true,
);
```

For granular sync, implement more of the `EditorFacade` interface — see the
[full documentation](https://jsonjoy.com/libs/collaborative-str).
