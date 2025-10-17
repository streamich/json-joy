# @jsonjoy.com/codegen

This package contains utilities for generating optimized JavaScript code at runtime.
It enables creating high-performance functions by generating code dynamically based
on schemas, templates, or runtime data.

## Key Benefits

JIT (Just-In-Time) code generation can provide significant performance improvements
when you have advance knowledge of the data structure or execution pattern.

Some examples:

- **Deep equality comparison function**: When one object is known in advance, we can
  generate an optimized function that efficiently compares against a single object.
  This technique is implemented in the `json-equal` library.

- **JSON Patch execution**: When the JSON Patch operations are known beforehand, we can
  generate an optimized function that applies the patch in the most efficient way.
  This approach is used in the `json-patch` library.

- **Schema-based validation**: Given a `json-type` schema of a JSON object, it's possible
  to generate highly optimized functions for validation and serialization that avoid
  generic overhead and execute significantly faster than traditional approaches.
