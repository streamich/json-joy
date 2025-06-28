/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/docs-obj.ts
 */

import {Model} from '..';

const model = Model.create(void 0, 1234); // 1234 is session ID

model.api.set({
  foo: {
    bar: {
      x: 1,
      y: 2,
    },
  },
});

console.log(model.root + '');
// RootNode 0.0
// └─ ObjNode 1234.1
//    └─ "foo"
//        └─ ObjNode 1234.2
//           └─ "bar"
//               └─ ObjNode 1234.3
//                  ├─ "x"
//                  │   └─ ConNode 1234.4 { 1 }
//                  └─ "y"
//                      └─ ConNode 1234.5 { 2 }

console.log(model.view());
// { foo: { bar: { x: 1, y: 2 } } }

// Retrieve node at path ['foo', 'bar'] as "obj" type.
const bar = model.api.obj(['foo', 'bar']);
console.log(bar + '');
// ObjectApi
// └─ ObjNode 1234.3
//    ├─ "x"
//    │   └─ ConNode 1234.4 { 1 }
//    └─ "y"
//        └─ ConNode 1234.5 { 2 }

bar.set({
  x: 24,
  z: 42,
});
console.log(bar + '');
// ObjectApi
// └─ ObjNode 1234.3
//    ├─ "x"
//    │   └─ ConNode 1234.10 { 24 }
//    ├─ "y"
//    │   └─ ConNode 1234.5 { 2 }
//    └─ "z"
//        └─ ConNode 1234.11 { 42 }

console.log(bar.view());
// { x: 24, y: 2, z: 42 }

bar.del(['y']);

console.log(bar + '');
// ObjectApi
// └─ ObjNode 1234.3
//    ├─ "x"
//    │   └─ ConNode 1234.10 { 24 }
//    ├─ "y"
//    │   └─ ConNode 1234.13 { undefined }
//    └─ "z"
//        └─ ConNode 1234.11 { 42 }

console.log(bar.view());
// { x: 24, z: 42 }

console.log(model.view());
// { foo: { bar: { x: 24, z: 42 } } }
