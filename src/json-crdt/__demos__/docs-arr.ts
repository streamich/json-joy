/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/docs-arr.ts
 */

import {Model} from '..';
import {konst} from '../../json-crdt-patch';

console.clear();

const model = Model.withLogicalClock(1234); // 1234 is session ID

model.api.set({
  tags: ['big', 'small', 'red'],
});

console.log(model.view());
// { tags: [ 'big', 'small', 'red' ] }

console.log(model.root + '');
// RootNode 0.0
// └─ ObjNode 1234.1
//    └─ "tags"
//        └─ ArrNode 1234.2
//           └─ ArrChunk 1234.17!3 len:3
//              ├─ [0]: StrNode 1234.3 { "big" }
//              │       └─ StrChunk 1234.4!3 len:3 { "big" }
//              ├─ [1]: StrNode 1234.7 { "small" }
//              │       └─ StrChunk 1234.8!5 len:5 { "small" }
//              └─ [2]: StrNode 1234.13 { "red" }
//                      └─ StrChunk 1234.14!3 len:3 { "red" }

model.api.obj([]).set({
  tags: [konst('big'), konst('small'), konst('red')],
});

console.log(model.view());
// { tags: [ 'big', 'small', 'red' ] }

console.log(model.root + '');
// RootNode 0.0
// └─ ObjNode 1234.1
//    └─ "tags"
//        └─ ArrNode 1234.22
//           └─ ArrChunk 1234.26!3 len:3
//              ├─ [0]: ConNode 1234.23 { "big" }
//              ├─ [1]: ConNode 1234.24 { "small" }
//              └─ [2]: ConNode 1234.25 { "red" }

// Retrieve node at path ['tags'] as "arr" type.
const tags = model.api.arr(['tags']);
console.log(tags + '');
// ArrApi
// └─ ObjNode 1234.22
//    └─ ArrChunk 1234.26!3 len:3
//       ├─ [0]: ConNode 1234.23 { "big" }
//       ├─ [1]: ConNode 1234.24 { "small" }
//       └─ [2]: ConNode 1234.25 { "red" }

tags.ins(1, [konst('medium'), konst('blue')]);
console.log(tags + '');
// ArrApi
// └─ ArrNode 1234.22
//    └─ ArrChunk 1234.32!2 len:5
//       ├─ [1]: ConNode 1234.30 { "medium" }
//       └─ [2]: ConNode 1234.31 { "blue" }
//       ← ArrChunk 1234.26!1 len:1
//         └─ [0]: ConNode 1234.23 { "big" }
//       → ArrChunk 1234.27!2 len:2
//         ├─ [3]: ConNode 1234.24 { "small" }
//         └─ [4]: ConNode 1234.25 { "red" }

console.log(tags.view());
// [ 'big', 'medium', 'blue', 'small', 'red' ]

tags.del(2, 2);
console.log(tags + '');
// ArrApi
// └─ ArrNode 1234.22
//    └─ ArrChunk 1234.32!1 len:3
//       └─ [1]: ConNode 1234.30 { "medium" }
//       ← ArrChunk 1234.26!1 len:1
//         └─ [0]: ConNode 1234.23 { "big" }
//       → ArrChunk 1234.33!1 len:1 [1]
//         → ArrChunk 1234.27!1 len:1 [1]
//           → ArrChunk 1234.28!1 len:1
//             └─ [2]: ConNode 1234.25 { "red" }

console.log(model.view());
// { tags: [ 'big', 'medium', 'red' ] }
