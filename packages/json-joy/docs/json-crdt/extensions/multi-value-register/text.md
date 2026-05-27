The multi-value register extension is represented by the `mval` node, which is
similar to the regular `val` (single value register) node, but it allows to
store multiple values if they were inserted concurrently (at the same logical
time). When two (or more) concurrent writes happen to a `val` node, the one
with the highest logical time wins; but when two (or more) concurrent writes
happen to a `mval` node, all of them are stored in the node.

To use the multi-value register extension, one needs to register it with the
model:

```ts
import {MvalExt} from 'json-joy/es2020/json-crdt-extensions';

const model = Model.withLogicalClock(1234);

model.ext.register(MvalExt);
```

To create a new `mval` node use `MvalExt.new(<value>)` in place where you would
use the `val` node:

```ts
model.api.root({
  score: MvalExt.new(1),
});

console.log(model + '');
```

```
model
├─ root 0.0
│  └─ obj 1234.1
│     └─ "score"
│         └─ mval
│            └─ arr 1234.4 
│               └─ ArrChunk 1234.8!1 len:1
│                  └─ [0]: val 1234.5
│                          └─ con 1234.6 { 1 }
│  
├─ index (6 nodes)
│  ├─ obj 1234.1
│  ├─ vec 1234.2
│  ├─ con 1234.3
│  ├─ arr 1234.4
│  ├─ val 1234.5
│  └─ con 1234.6
│  
├─ view
│  └─ {
│       "score": [
│         1
│       ]
│     }
│  
├─ clock 1234.12
│  
└─ extensions
   └─ 0: mval
```

To get access to the API wrapper of the `mval` node use the `.asExt(MvalExt)`
method:

```ts
const api = model.api.in(['score']).asExt(MvalExt);
```

Using the API wrapper you can access the values stored in the `mval` node:

```ts
const values = api.view();
```

And you can also manipulate the `mval` node:

```jj.aside
Here we use `s` schema builder from the `json-crdt` sub-library to avoid `2`
being wrapped in an extra `val` node.
```

```ts
api.set(s.con(2));
```

In the JSON structure the `mval` node is represented by a JSON array of all the
concurrently inserted values:

```ts
console.log(model + '');
```

```
model
├─ root 0.0
│  └─ obj 1234.1
│     └─ "score"
│         └─ mval
│            └─ arr 1234.4 
│               └─ ArrChunk 1234.14!1 len:1
│                  └─ [0]: con 1234.13 { 2 }
│  
├─ index (5 nodes)
│  ├─ obj 1234.1
│  ├─ vec 1234.2
│  ├─ con 1234.3
│  ├─ arr 1234.4
│  └─ con 1234.13
│  
├─ view
│  └─ {
│       "score": [
│         2
│       ]
│     }
│  
├─ clock 1234.15
│  
└─ extensions
   └─ 0: mval
```
