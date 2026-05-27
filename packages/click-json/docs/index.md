`@jsonjoy.com/click-json` is a small React library for rendering JSON, and
[JSON CRDT](/libs/json-joy-js/json-crdt) documents, as an interactive,
clickable, and editable tree.

~~~jj.screenshot
{
  "src": "https://appsets.jsonjoy.com/libraries/clickable-json/json-demo.gif",
  "alt": "click-json JSON document demo",
  "retinaFactor": 1,
  "noPadding": true
}
~~~

It ships two top-level components:

- [`<ClickableJson>`](/libs/click-json/json) renders any plain JavaScript value
  (POJO) as a collapsible tree. When `onChange` is provided, every edit is
  reported as a [JSON Patch (RFC 6902)](https://datatracker.ietf.org/doc/html/rfc6902)
  so the parent owns the document.
- [`<ClickableJsonCrdt>`](/libs/click-json/json-crdt) renders a live `json-joy` `Model` and
  mutates it in place. Each CRDT node is shown with its logical ID, the type
  switcher exposes every JSON CRDT node kind (`con`, `val`, `obj`, `vec`,
  `arr`, `str`, `bin`), and known extensions (`mval`, `peritext`, `quill`) are
  recognized automatically.


## Installation

```
npm install @jsonjoy.com/click-json
```

`react`, `react-dom`, and `tslib` are declared as peer dependencies. `json-joy`
is bundled as a runtime dependency and supplies the CRDT model types used by
`<ClickableJsonCrdt>`.


## Hello world

```ts
import {ClickableJson} from '@jsonjoy.com/click-json';

<ClickableJson
  doc={{name: 'click-json', stars: 42}}
  onChange={console.log} />;
```

Every property is clickable. Each edit is delivered as a JSON Patch array, the
component never mutates `doc` itself. Drop `onChange` to get a read-only viewer.


## When to use which component

| You have... | Use |
|---|---|
| A POJO you want to inspect or edit | [`<ClickableJson>`](/libs/click-json/json) |
| A `Model` from `json-joy/lib/json-crdt` | [`<ClickableJsonCrdt>`](/libs/click-json/json-crdt) |
| A read-only pretty-printer for logs or debugging | `<ClickableJson readonly formal>` |
| A debugger that exposes CRDT identities and conflict slots | `<ClickableJsonCrdt showRoot>` |


## Design notes

- **Declarative.** Both components render exactly what is in `doc` or `model`.
  `<ClickableJson>` reports edits and lets the parent decide what to do with
  them. `<ClickableJsonCrdt>` writes directly to the model and subscribes for
  re-renders.
- **Keyboard friendly.** Focus is tracked at the JSON pointer level. Pressing
  `Escape` clears the focus. The `onFocus` prop receives the current pointer
  (or `null`).
- **Themed via `nano-theme`.** No CSS file needs to be imported. Style
  overrides live on the component props (`compact`, `fontSize`, `formal`,
  `collapsed`, `noCollapseToggles`).
- **Binary aware.** `Uint8Array` values are rendered as a byte preview rather
  than expanded as an array.
