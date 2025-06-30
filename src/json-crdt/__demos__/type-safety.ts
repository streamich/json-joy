/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/type-safety.ts
 */

import {Model, type n} from '..';

console.clear();

const model = Model.create(void 0, 1234) as any as Model<
  n.obj<{
    num: n.con<number>;
    text: n.str;
    flags: n.arr<n.val<n.con<boolean>>>;
    verified?: n.con<boolean>;
  }>
>;

console.log(model + '');
console.log(model.view());

model.api.set({
  num: 123,
  text: 'hello',
  flags: [true, false],
});

const view = model.view();
console.log(view);
// { num: 123, text: 'hello', flags: [ true, false ] }

console.log(model + '');
// Model
// ├─ RootNode 0.0
// │  └─ ObjNode 1234.1
// │     ├─ "num"
// │     │   └─ ConNode 1234.2 { 123 }
// │     ├─ "text"
// │     │   └─ StrNode 1234.3 { "hello" }
// │     │      └─ StrChunk 1234.4!5 len:5 { "hello" }
// │     └─ "flags"
// │         └─ ArrNode 1234.9
// │            └─ ArrChunk 1234.14!2 len:2
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

console.log(model.s.$ + '');
// ObjectApi
// └─ ObjNode 1234.1
//    ├─ "num"
//    │   └─ ConNode 1234.2 { 123 }
//    ├─ "text"
//    │   └─ StrNode 1234.3 { "hello" }
//    │      └─ StrChunk 1234.4!5 len:5 { "hello" }
//    └─ "flags"
//        └─ ArrNode 1234.9
//           └─ ArrChunk 1234.14!2 len:2
//              ├─ [0]: ValNode 1234.11
//              │       └─ ConNode 1234.10 { true }
//              └─ [1]: ValNode 1234.13
//                      └─ ConNode 1234.12 { false }

console.log(model.s.flags.$ + '');
// ArrApi
// └─ ArrNode 1234.9
//    └─ ArrChunk 1234.14!2 len:2
//       ├─ [0]: ValNode 1234.11
//       │       └─ ConNode 1234.10 { true }
//       └─ [1]: ValNode 1234.13
//               └─ ConNode 1234.12 { false }

console.log(model.s.flags[1].$ + '');
// ValApi
// └─ ValNode 1234.13
//    └─ ConNode 1234.12 { false }

console.log(model.s.flags[1].val.$ + '');
// ConApi
// └─ ConNode 1234.12 { false }

console.log(model.s.num.$ + '');
// ConApi
// └─ ConNode 1234.2 { 123 }

console.log(model.s.text.$ + '');
// StrApi
// └─ StrNode 1234.3 { "hello" }
//    └─ StrChunk 1234.4!5 len:5 { "hello" }
