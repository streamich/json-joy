# Collaborative Ace Editor React Component

React component for collaborative editing in Ace Editor. Connects JSON CRDT
`str` node to Ace Editor, allowing multiple users to edit the same document
concurrently.


## Usage

Installation:

```
npm install json-joy @jsonjoy.com/collaborative-ace-react ace-builds react-ace react react-dom
```

Usage:

```tsx
import {Model, s} from 'json-joy/lib/json-crdt';
import {CollaborativeAce} from '@jsonjoy.com/collaborative-ace-react';

const model = Model.create(s.str('hello'));

const MyComponent = () => {
  return <CollaborativeAce str={() => model.s.$} />
};
```

The `CollaborativeAce` component accepts all props from `react-ace`'s
`AceEditor` component, plus a `str` prop that provides the collaborative string node.
