# React Portal convenience utilities

The `<Portal>` component automatically creates a new DOM element and appends
it to the end of the `document.body` element.

It also automatically tracks that new rendering root in the global app context,
this way it is possible to know of all rendering roots within a given React
sub-tree, which is used for native DOM operations.
