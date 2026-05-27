Excellent performance is one of the main design goals of `json-joy`. Many parts
of the library are benchmarked, and so is the `json-crdt` sub-library. See our
[CRDT benchmarks][list-crdt-benchmarks] blog post for more details. To execute
benchmarks yourself, clone the repository and see benchmarks in `__bench__` folders.

[list-crdt-benchmarks]: /blog/list-crdt-benchmarks



## How does `json-joy` compare to other libraries?

In our benchmarks when running real world editing traces `json-joy` core list
CRDT algorithm is about two orders of magnitude (100x) faster than `yjs`, `yrs`,
and `collabs`, however, `collabs` fails with a stack overflow on one of editing
traces. Compared to `automerge`, `json-joy` is about 1,000x faster, and `automerge` crashes
when executing some of the editing traces repeatedly.
