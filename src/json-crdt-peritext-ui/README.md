# Peritext UI

CRDT-native UI for JSON CRDT `peritext` extension. Supports block-level and
inline-level collaborative editing, with the ability to nest blocks.


## Software architecture layers

Below is the software architecture of the Peritext rich text editor. At the top
is the most user-facing layer, and at the bottom is the most foundational layer.

- Rendering surface plugins
- React rendering surface `<PeritextFragment controller={DomController} />`
- DOM event handlers, `new DomController(defaults: PeritextEventDefaults)`

- `PeritextEventDefaults`
- `PeritextEventTarget`
- `DataTransfer`
- `Editor`
- `SliceRegistry`
- `Fragment`
- `Overlay`
- Peritext JSON CRDT extension, `Peritext`
- `Log`
- `ModelApi`
- JSON CRDT, `Model`
