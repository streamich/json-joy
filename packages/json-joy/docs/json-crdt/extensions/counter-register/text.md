The counter `cnt` extension allows to instantiate counter `cnt` nodes. The
counter node is a simple numeric value, which can be incremented or decremented.
Under the covers, a counter per document fork (per session ID) is maintained.
The resulting *view* of the `cnt` node is the sum of all those counters. This
allows to have a single counter value, which can be independently incremented
and decremented by multiple users.

To use the counter extension, one needs to register it with the model:

```ts
import {CntExt} from 'json-joy/es2020/json-crdt-extensions';

const model = Model.withLogicalClock(1234);

model.ext.register(CntExt);
```

To create a new `cnt` node use `CntExt.new(<value>)` in place where you would
use any other JSON CRDT node:

```ts
model.api.root({
  counter: CntExt.new(1),
});

console.log(model + '');
```

```
model
├─ root 0.0
│  └─ obj 1234.1
│     └─ "counter"
│         └─ cnt (1)
│            └─ obj 1234.4
│               └─ "0"
│                   └─ con 1234.5 { 1 }
│  
├─ index (5 nodes)
│  ├─ obj 1234.1
│  ├─ vec 1234.2
│  ├─ con 1234.3
│  ├─ obj 1234.4
│  └─ con 1234.5
│  
├─ view
│  └─ {
│       "counter": 1
│     }
│  
├─ clock 1234.10
│  
└─ extensions
   └─ 1: cnt
```

To get access to the API wrapper of the `cnt` node use the `.asExt(CntExt)`
method:

```ts
const api = model.api.in(['counter']).asExt(CntExt);
```

Using the API wrapper you can access the values stored in the `cnt` node:

```ts
const values = api.view();
```

And you can also increment and decrement the counter:

```ts
api.inc(10);
```

The view of the counter is represented as a single JSON number, however,
under-the-hood it is a map of all counters by session ID.

```ts
console.log(model + '');
```

```
model
├─ root 0.0
│  └─ obj 1234.1
│     └─ "counter"
│         └─ cnt (11)
│            └─ obj 1234.4
│               ├─ "0"
│               │   └─ con 1234.5 { 1 }
│               └─ "ya"
│                   └─ con 1234.10 { 10 }
│  
├─ index (6 nodes)
│  ├─ obj 1234.1
│  ├─ vec 1234.2
│  ├─ con 1234.3
│  ├─ obj 1234.4
│  ├─ con 1234.5
│  └─ con 1234.10
│  
├─ view
│  └─ {
│       "counter": 11
│     }
│  
├─ clock 1234.12
│  
└─ extensions
   └─ 1: cnt
```
