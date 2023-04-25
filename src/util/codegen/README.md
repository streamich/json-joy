# util/codegen

This folder contains utilities for generating code. It is sometimes possible to
generate an optimized function that will execute significantly faster given
a "schema", or "template", of execution.

Some examples:

- Deep equality comparison function: if we know one object in advance we can
  generate an optimized function which accepts a single object. It is
  implemented in `json-equal` library.
- JSON Patch execution: if we know the JSON Patch in advance, we can generate
  an optimized function which applies the JSON patch in the most efficient way.
  It is implemented in `json-patch` library.
- Given a `json-type` schema of a JSON object, it is possible to generate
  optimized functions for validation and serialization of objects according to
  that schema.
