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


## React Usage

Installation:

```
npm install @jsonjoy.com/collaborative-quill json-joy quill quill-delta react react-dom
```

Usage:


```tsx
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {CollaborativeQuill} from '@jsonjoy.com/collaborative-quill/lib/CollaborativeQuill';

const model = ModelWithExt.create(ext.quill.new('abc'));

const MyComponent = () => {
  return <CollaborativeQuill api={model.s.toExt()} />
};
```


## Preview

- See [demo](https://streamich.github.io/collaborative-quill).
