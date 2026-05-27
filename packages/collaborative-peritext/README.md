# Collaborative rich-text editor binding

Binds a generic rich-text editor to a JSON CRDT `peritext` node, enabling
real-time collaborative rich-text editing.

📖 **[Full documentation →](https://jsonjoy.com/libs/collaborative-peritext)**


## Installation

```
npm install json-joy @jsonjoy.com/collaborative-peritext
```


## Usage

```ts
import {PeritextBinding, type RichtextEditorFacade} from '@jsonjoy.com/collaborative-peritext';

const editor: RichtextEditorFacade = {
  get: () => toViewRange(myEditor),
  set: (fragment) => renderFragment(myEditor, fragment),
  // optional: onchange, getSelection, setSelection, dispose
};

const unbind = PeritextBinding.bind(() => peritextApi, editor);
```

See the [full documentation](https://jsonjoy.com/libs/collaborative-peritext)
for the complete `RichtextEditorFacade` interface.


## Funding

This project is funded through [NGI Zero Core](https://nlnet.nl/core), a fund established by [NLnet](https://nlnet.nl) with financial support from the European Commission's [Next Generation Internet](https://ngi.eu) program. Learn more at the [NLnet project page](https://nlnet.nl/project/JSON-Joy-Peritext).

[<img src="https://nlnet.nl/logo/banner.png" alt="NLnet foundation logo" width="20%" />](https://nlnet.nl)
[<img src="https://nlnet.nl/image/logos/NGI0_tag.svg" alt="NGI Zero Logo" width="20%" />](https://nlnet.nl/core)

