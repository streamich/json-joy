# Collaborative Monaco Editor React Component

React component for collaborative editing in Monaco Editor. Connects JSON CRDT
`str` node to Monaco Editor, allowing multiple users to edit the same document
concurrently.


## Usage

Installation:

```
npm install json-joy @jsonjoy.com/collaborative-monaco-react monaco-editor @monaco-editor/react react react-dom
```

Usage:

```tsx
import {Model, s} from 'json-joy/lib/json-crdt';
import {CollaborativeMonaco} from '@jsonjoy.com/collaborative-monaco-react';

const model = Model.create(s.str('hello'));

const MyComponent = () => {
  return <CollaborativeMonaco str={() => model.s.$} />
};
```

The `CollaborativeMonaco` component accepts all props from `@monaco-editor/react`'s
`Editor` component, plus a `str` prop that provides the collaborative string node.
