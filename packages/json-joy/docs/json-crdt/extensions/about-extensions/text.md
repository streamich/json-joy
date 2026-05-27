The `json-joy` extensions for JSON CRDT allow developers to create new CRDTs
out of the built-in CRDT nodes (`con`, `val`, `obj`, `vec`, `str`, `bin`,
`arr`).

The extensions are a feature of the `json-joy` library, not the JSON CRDT
specification. Extensions are implemented by the `json-joy` library and are not
required to be implemented by other libraries that implement the JSON CRDT
specification. However, the underlying model state and patches still follow the
JSON CRDT specification and are compatible with other implementations. Hence,
other JSON CRDT implementation can still process the patches of the `json-joy`
extension types, even though they might not understand the semantics of the
extensions.


## Using extensions

To use an extension, first, the extension must be registered with the model
object of you document.

```ts
const model = Model.withLogicalClock();
model.ext.register(MyExtension);
```

To create a new node of the extension type, use the `.new()` method of the
extension.

```ts
model.api.root({
  value: MyExtension.new(),
});
```

To read the view of the extension node, use the `.view()` method as usual. To
manipulate the extension node, use the `.asExt()` wrapper, which will return an
extension-specific API.

```ts
const api = model.api.in(['value']).asExt(MyExtension);
```


## Creating extensions

Creating new extensions is an advanced feature and is not required for most
applications. However, if you need to create a new CRDT type, you can do so by
creating a new extension.

In this section we will briefly cover the process of creating a new extension.
For detailed examples, see the `json-crdt-extensions` sub-library of the
`json-joy` library.

To create a new extension, you need to implement the `ExtensionDefinition`
interface:

```ts
import {ExtensionDefinition} from 'json-joy/es2020/json-crdt';

export const MyExtension: ExtensionDefinition = {
  id,
  name,
  new,
  Node,
  Api,
};
```

- `id` is a globally unique number that identifies the extension.
- `name` is a human-readable name of the extension.
- `new` is a function that creates a new node of the extension type.
- `Node` is the class that represents the extension node.
- `Api` is the class that represents the extension API, which is used to
  manipulate the extension node.


## Extension inner workings

What is an extension? An extension is simply a `vec` node with a specific
structure, such that the `json-joy` library knows to interpret it as an
extension.

The extension node is a regular JSON CRDT `vec` node, and it is processed by
the `json-joy` library as a regular `vec` node. The only difference is that
the *view* of the extension node can be overridden by the extension implementation
and the extension can add new semantic operations to manipulate values in the
extension node.

For the `json-joy` library to treat a `vec` node as an extension, the `vec`
node must follow the following format:

```
vec
├─ 0: con Uin8Array { <ext_id>, <sid_mod_256>, <time_mod_256> }
└─ 1: any
```

- The `vec` node is a 2-tuple, where the first value is a `con` `Uint8Array` and
  the second value is any JSON CRDT node.
  - The `con` `Uint8Array`, the first 2-tuple element, must be exactly 3 bytes
    long.
     - The first byte must be equal to some registered extensions ID.
     - The second byte must be equal to session ID part of the `vec` node ID
       modulo 256.
     - The third byte must be equal to the time sequence part of the `vec` node
       ID modulo 256.
  - The second value is the actual value of the extension node. The value can be
    any JSON CRDT node, including another `vec` node.

Lets create a simple Multi-Value Register extension `mval` as an example. We
create a document with just the `mval` value set to `1`:

```ts
const model = Model.withLogicalClock(1234);
model.ext.register(ValueMvExt);
model.api.root(ValueMvExt.new(s.con(1)));

console.log(model + '');
```

This will output the following printout:

```
model
├─ root 0.0
│  └─ mval
│     └─ arr 1234.3 
│        └─ ArrChunk 1234.5!1 len:1
│           └─ [0]: con 1234.4 { 1 }
│  
├─ index (4 nodes)
│  ├─ vec 1234.1
│  ├─ con 1234.2
│  ├─ arr 1234.3
│  └─ con 1234.4
│  
├─ view
│  └─ [
│       1
│     ]
│  
├─ clock 1234.8
│  
└─ Extensions
   └─ 0: mval
```

One can see that the `mval` node is backed by the `arr` node, with a single
value set to `1`. At the very bottom of the printout, one can see that the
`mval` extension is registered with the model.

Now lets serialize and un-serialize, this will result into the same model, but
the extension will not be registered with the un-serialized model:

```ts
const model2 = Model.fromBinary(model.toBinary());

console.log(model2 + '');
```

When the extension is not registered, one can see that the `mval` extension node
is actually a `vec` 2-tuple, where the first `con` `Uint8Array` is the extension
header and the second value is the actual data of the extension node:

```
model
├─ root 0.0
│  └─ vec 1234.1
│     ├─ 0: con 1234.2 Uint8Array { 0, 210, 1 }
│     └─ 1: arr 1234.3 
│           └─ ArrChunk 1234.5!1 len:1
│              └─ [0]: con 1234.4 { 1 }
│  
├─ index (4 nodes)
│  ├─ vec 1234.1
│  ├─ con 1234.2
│  ├─ arr 1234.3
│  └─ con 1234.4
│  
├─ view
│  └─ [
│       {
│         "0": 0,
│         "1": 210,
│         "2": 1
│       },
│       [
│         1
│       ]
│     ]
│  
└─ clock 1234.8
```

The difference is only in the view presentation, the underlying model state is
is exactly the same, the underlying JSON CRDT Patch operations are also the
same. All implementations of JSON CRDT, even those that do not understand the
`mval` extension, can still process the patches of the `mval` extension type.
