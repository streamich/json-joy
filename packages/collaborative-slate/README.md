# @jsonjoy.com/collaborative-slate

Provides integration between [json-joy](https://github.com/streamich/json-joy) JSON CRDTs
(specifically the Peritext implementation) and [Slate.js](https://github.com/ianstormtaylor/slate) /
[Plate.js](https://github.com/udecode/plate) editors, enabling real-time collaborative rich-text
editing capabilities.

## Features

- 🔄 **Real-time collaboration** — Multiple users can edit the same document simultaneously
- 🧠 **CRDT-based** — Conflict-free resolution using json-joy's Peritext implementation
- 📝 **Slate.js compatible** — Works with vanilla Slate.js editors
- 🍽️ **Plate.js compatible** — Works with Plate.js plugin-based editors
- ⚡ **Efficient sync** — Only changes are synchronized, not the entire document

## Installation

```bash
npm install @jsonjoy.com/collaborative-slate slate slate-react react react-dom
```

## Usage

```typescript
import {bind} from '@jsonjoy.com/collaborative-slate';
import {createEditor} from 'slate';
import {withReact} from 'slate-react';

// Create your Slate editor
const editor = withReact(createEditor());

// Get your json-joy peritext node
const peritext = model.s.toExt().txt;

// Bind them together for collaborative editing
const unbind = bind(peritext, editor);

// When done (e.g., component unmount), disconnect
unbind();
```

## Demos

This package includes two demos showing the editor integration:

### Slate.js Demo

A basic rich-text editor using vanilla Slate.js:

```bash
cd packages/collaborative-slate
yarn demo:slate
```

Then open http://localhost:9881 in your browser.

### Plate.js Demo

A rich-text editor using Plate.js (which builds on Slate.js):

```bash
cd packages/collaborative-slate
yarn demo:plate
```

Then open http://localhost:9882 in your browser.

## API

### `bind(peritext, editor)`

Connects a json-joy Peritext node to a Slate.js Editor instance.

**Parameters:**

- `peritext` — The json-joy Peritext node (string CRDT)
- `editor` — The Slate.js `Editor` instance (also works with Plate.js editors)

**Returns:**

- A cleanup function to disconnect the binding

## Development

```bash
# Install dependencies
yarn install

# Run Slate.js demo
yarn demo:slate

# Run Plate.js demo  
yarn demo:plate

# Run tests
yarn test

# Type check
yarn typecheck

# Build
yarn build
```

## License

Apache-2.0
