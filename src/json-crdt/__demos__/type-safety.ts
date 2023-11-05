/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/type-safety.ts
 */

import {Model, n} from '..';

const model = Model.withLogicalClock(1234) as Model<
  n.obj<{
    num: n.con<number>;
    text: n.str;
    flags: n.arr<n.val<n.con<boolean>>>;
    verified?: n.con<boolean>;
  }>
>;

console.log(model + '');
console.log(model.view());

model.api.root({
  num: 123,
  text: 'hello',
  flags: [true, false],
});

const view = model.view();
console.log(view);
// { num: 123, text: 'hello', flags: [ true, false ] }

console.log(model + '');
// Model
// ├─ RootLww "val" 0.0
// │  └─ ObjectLww "obj" 1234.1
// │     ├─ "num"
// │     │   └─ ConNode 1234.2 { 123 }
// │     ├─ "text"
// │     │   └─ StringRga "str" 1234.3 { "hello" }
// │     │      └─ StringChunk 1234.4!5 len:5 { "hello" }
// │     └─ "flags"
// │         └─ ArrayRga "arr" 1234.9
// │            └─ ArrayChunk 1234.14!2 len:2
// │               ├─ [0]: ValNode 1234.11
// │               │       └─ ConNode 1234.10 { true }
// │               └─ [1]: ValNode 1234.13
// │                       └─ ConNode 1234.12 { false }
// │
// └─ VectorClock 1234.18

console.log(model.view().num);
// 123
console.log(model.view().text);
// hello
console.log(model.view().flags[0]);
// true

console.log(model.find.val.toApi() + '');
// ObjectApi
// └─ ObjectLww "obj" 1234.1
//    ├─ "num"
//    │   └─ ConNode 1234.2 { 123 }
//    ├─ "text"
//    │   └─ StringRga "str" 1234.3 { "hello" }
//    │      └─ StringChunk 1234.4!5 len:5 { "hello" }
//    └─ "flags"
//        └─ ArrayRga "arr" 1234.9
//           └─ ArrayChunk 1234.14!2 len:2
//              ├─ [0]: ValNode 1234.11
//              │       └─ ConNode 1234.10 { true }
//              └─ [1]: ValNode 1234.13
//                      └─ ConNode 1234.12 { false }

console.log(model.find.val.flags.toApi() + '');
// ArrayApi
// └─ ArrayRga "arr" 1234.9
//    └─ ArrayChunk 1234.14!2 len:2
//       ├─ [0]: ValNode 1234.11
//       │       └─ ConNode 1234.10 { true }
//       └─ [1]: ValNode 1234.13
//               └─ ConNode 1234.12 { false }

console.log(model.find.val.flags[1].toApi() + '');
// ValApi
// └─ ValNode 1234.13
//    └─ ConNode 1234.12 { false }

console.log(model.find.val.flags[1].val.toApi() + '');
// ConApi
// └─ ConNode 1234.12 { false }

console.log(model.find.val.num.toApi() + '');
// ConApi
// └─ ConNode 1234.2 { 123 }

console.log(model.find.val.text.toApi() + '');
// StringApi
// └─ StringRga "str" 1234.3 { "hello" }
//    └─ StringChunk 1234.4!5 len:5 { "hello" }
