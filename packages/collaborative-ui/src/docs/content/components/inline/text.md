The *inline* elements don't start on a new line. They are used to format parts
of the text, they take as much space as needed and they don't break the flow of
the content. The inline components normally have their CSS `display` property
set to `inline`.

You import the inline components from the `1-inline` folder
to reduce the bundle size.

```ts
import {Component, ComponentProps} from 'nice-ui/lib/1-inline/Component';
```
