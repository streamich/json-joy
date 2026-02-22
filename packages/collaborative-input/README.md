# Collaborative `<input>` and `<textarea>` elements

This package provides bindings for `<input>` and `<textarea>` elements to
JSON CRDT data structures. It allows multiple users to edit the `<input>` and
`<textarea>` elements simultaneously.


## Usage

Installation:

```
npm install json-joy @jsonjoy.com/collaborative-input
```

Usage:

```ts
import {bind} from '@jsonjoy.com/collaborative-input';

const str = model.api.str(['path', 'to', 'string']);
const input = document.getElementById('input');
const unbind = bind(str, input);

// When done, unbind the binding.
unbind();
```


## Preview

See [demo](https://streamich.github.io/collaborative-input).
