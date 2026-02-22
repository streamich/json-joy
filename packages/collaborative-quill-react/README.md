# Collaborative Quill Editor React Component

React component for collaborative editing in Quill Editor. Connects JSON CRDT
`quill-delta` node to Quill Editor, allowing multiple users to edit the same
rich-text document concurrently.


## Usage

Installation:

```
npm install json-joy @jsonjoy.com/collaborative-quill-react quill quill-delta react react-dom
```

Usage:

```tsx
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {CollaborativeQuill} from '@jsonjoy.com/collaborative-quill-react';

const model = ModelWithExt.create(ext.quill.new('hello'));

const MyComponent = () => {
  return <CollaborativeQuill api={() => model.s.toExt()} />
};
```

The `CollaborativeQuill` component accepts all props from a standard `div` element,
plus the following props:

- `api`: A function that returns the `QuillDeltaApi` instance for the collaborative document.
- `options`: Quill editor options (theme, modules, etc.).
- `readonly`: Whether the editor is read-only.
- `themeCss`: Custom CSS URL for the Quill theme.
- `onEditor`: Callback called with the Quill editor instance.
- `onTextChange`: Callback for text change events.
- `onSelectionChange`: Callback for selection change events.
- `onEditorChange`: Callback for all editor change events.

