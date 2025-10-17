# Side-car encoding

The `sidecar` format is an out-of-band encoding format for JSON CRDT, where
the view is encoded as plain JSON/CBOR document and all CRDT metadata is
encoded in a separate blob.

## View node references

Consider a JSON view:

```json
{
  "a": {
    "b": {
      "d": "foo",
      "c": [1, 2, 3]
    }
  }
}
```

We can reference any element in the view by a path of keys and array indices.

```js
0:  []                                 // Whole document
1:  ['a']                              // Key at root field "a"
2:  ['a', value]                       // Object at root field "a"
3:  ['a', 'b']                         // Key at root field "a", field "b"
4:  ['a', 'b', value]                  // Object at root field "a", field "b"
5:  ['a', 'b', 'c']                    // Key at root field "a", field "b", field "c"
6:  ['a', 'b', 'c', value]             // Array at root field "a", field "b", field "c"
7:  ['a', 'b', 'c', value, 0]          // Element at root field "a", field "b", field "c", index 0
8:  ['a', 'b', 'c', value, 1]          // Element at root field "a", field "b", field "c", index 1
9:  ['a', 'b', 'c', value, 2]          // Element at root field "a", field "b", field "c", index 2
10: ['a', 'b', 'd']                    // Key at root field "a", field "b", field "d"
11: ['a', 'b', 'd', value]             // String at root field "a", field "b", field "d"
```

When skipping objects:

```js
0:  ['a']                              // Key at root field "a"
1:  ['a', 'b']                         // Key at root field "a", field "b"
2:  ['a', 'b', 'c']                    // Key at root field "a", field "b", field "c"
3:  ['a', 'b', 'c', value, 0]          // Element at root field "a", field "b", field "c", index 0
4:  ['a', 'b', 'c', value, 1]          // Element at root field "a", field "b", field "c", index 1
5:  ['a', 'b', 'c', value, 2]          // Element at root field "a", field "b", field "c", index 2
6: ['a', 'b', 'd']                    // Key at root field "a", field "b", field "d"
```
