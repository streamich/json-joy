# mu-txt-element

`<mu-txt>` &mdash; a custom element wrapping the [MuTxt](../mu-txt-react) rich-text editor.

## Use from a CDN

```html
<script src="https://cdn.jsdelivr.net/npm/mu-txt-element/dist/mu-txt-element.min.js"></script>

<mu-txt></mu-txt>
```

## Use from npm

```bash
npm install mu-txt-element
```

```js
import 'mu-txt-element';
```

Then use `<mu-txt></mu-txt>` anywhere in your HTML.

## Seeding the document

`<mu-txt>` accepts an initial document via either inline children or an external source. The seed is consumed once at mount; later changes are ignored.

```html
<!-- Plain text from children (default when children are present) -->
<mu-txt>
  Just some plain text. Newlines become paragraphs.
</mu-txt>

<!-- Markdown from children -->
<mu-txt format="markdown">
  # Hello

  A paragraph with **bold** and a [link](https://jsonjoy.com).

  - bullet one
  - bullet two
</mu-txt>

<!-- Slate-like JSON from children -->
<mu-txt format="slate">
  [{"type":"h1","children":[{"text":"Hi"}]}]
</mu-txt>

<!-- Native binary .mutxt document via a data URL -->
<mu-txt src="data:application/vnd.mutxt;base64,..."></mu-txt>
	
<!-- Native binary .mutxt document fetched from a URL -->
<mu-txt src="/docs/intro.mutxt"></mu-txt>
```

### `format` attribute

| value | meaning |
|---|---|
| `text` | Each line of source becomes a paragraph (default when children are present). |
| `markdown` | Markdown source &mdash; rendered to rich text. |
| `slate` | A JSON-serialised Slate document. |
| `native` | mu-txt's own binary format (history-preserving). Requires `src`; cannot live in children. Default when `src` is present. |

### `src` attribute

Any URL the browser can `fetch()` &mdash; including `https://`, relative paths, `data:` URLs, and `blob:` URLs. The data URL form replaces ad-hoc base64 attributes:

```html
<mu-txt src="data:application/vnd.mutxt;base64,o2F0eXBlYW11dHh0..."></mu-txt>
```

When `src` is set, children are ignored.

### Indentation

For text/markdown/slate-from-children, the smallest leading whitespace common to every non-empty line is stripped before parsing. So you can indent the inline content along with the surrounding HTML and the parser sees clean, left-aligned source.

There are two known caveats: content placed on the same line as the opening tag clamps the dedent baseline to 0 (put content on the next line), and tabs and spaces are compared as raw characters (don't mix them).

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
import {MuTxtElement} from 'mu-txt-element';
class MyEditor extends MuTxtElement {}
customElements.define('my-editor', MyEditor);
```
