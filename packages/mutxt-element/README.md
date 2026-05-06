# mutxt-element

`<mu-txt>` &mdash; a custom element wrapping the [MuTxt](../mutxt-react) rich-text editor.

## Use from a CDN

```html
<script src="https://cdn.jsdelivr.net/npm/mutxt-element/dist/mutxt-element.min.js"></script>

<mu-txt></mu-txt>
```

## Use from npm

```bash
npm install mutxt-element
```

```js
import 'mutxt-element';
```

Then use `<mu-txt></mu-txt>` anywhere in your HTML.

## API

The element exposes the editor controller (`MuTxtApi`) as `.api` once mounted:

```js
const el = document.querySelector('mu-txt');
const api = await el.ready(); // wait for the editor to mount
api.focus();
```

Or listen for the `ready` event:

```js
el.addEventListener('ready', (e) => {
  const api = e.detail; // MuTxtApi
});
```

## Custom tag name

Subclass and register under a different name:

```js
import {MuTxtElement} from 'mutxt-element';
class MyEditor extends MuTxtElement {}
customElements.define('my-editor', MyEditor);
```
