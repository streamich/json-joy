/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/docs-vec.ts
 */

import {Model} from '..';
import {vec} from '../../json-crdt-patch';

const model = Model.withLogicalClock(1234); // 1234 is session ID

model.api.root({
  foo: {
    bar: vec(1, 2),
  },
});

console.log(model.root + '');
// RootLww "val" 0.0
// └─ ObjectLww "obj" 1234.1
//    └─ "foo"
//        └─ ObjectLww "obj" 1234.2
//           └─ "bar"
//               └─ VecNode 1234.3
//                  ├─ 0: ConNode 1234.4 { 1 }
//                  └─ 1: ConNode 1234.5 { 2 }

console.log(model.view());
// { foo: { bar: [ 1, 2 ] } }

// Retrieve node at path ['foo', 'bar'] as "vec" type.
const bar = model.api.vec(['foo', 'bar']);
console.log(bar + '');
// VecApi
// └─ VecNode 1234.3
//    ├─ 0: ConNode 1234.4 { 1 }
//    └─ 1: ConNode 1234.5 { 2 }

bar.set([
  [0, 24],
  [2, 42],
]);
console.log(bar + '');
// VecApi
// └─ VecNode 1234.3
//    ├─ 0: ConNode 1234.10 { 24 }
//    ├─ 1: ConNode 1234.5 { 2 }
//    └─ 2: ConNode 1234.11 { 42 }

console.log(bar.view());
// [ 24, 2, 42 ]

console.log(model.view());
// { foo: { bar: [ 24, 2, 42 ] } }
