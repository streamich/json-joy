# click-type

Interactive [JSON Type](https://github.com/streamich/json-joy/tree/master/packages/json-type)
schema explorer and editor. The sibling of
[`@jsonjoy.com/click-json`](https://github.com/streamich/json-joy/tree/master/packages/click-json):
where `click-json` renders a JSON *value*, `click-type` renders a JSON Type
*schema* as a clickable, read-only-or-editable tree.

## Usage

Installation:

```
npm install @jsonjoy.com/click-type
```

Usage:

```tsx
import {ClickableType} from '@jsonjoy.com/click-type';

<ClickableType />;
```
