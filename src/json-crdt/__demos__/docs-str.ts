/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/docs-str.ts
 */

import {Model} from '..';

const model = Model.create(void 0, 1234); // 1234 is session ID

model.api.set({
  text: 'hello',
});

console.log(model.root + '');
// RootNode 0.0
// └─ ObjNode 1234.1
//    └─ "text"
//        └─ StrNode 1234.2 { "hello" }
//           └─ StrChunk 1234.3!5 len:5 { "hello" }

console.log(model.view());
// { text: 'hello' }

// Retrieve node at path ['text'] as "str" type.
const text = model.api.str(['text']);
console.log(text + '');
// StrApi
// └─ StrNode 1234.2 { "hello" }
//    └─ StrChunk 1234.3!5 len:5 { "hello" }

text.ins(5, ' world');
console.log(text + '');
// StrApi
// └─ StrNode 1234.2 { "hello world" }
//    └─ StrChunk 1234.10!6 len:11 { " world" }
//       ← StrChunk 1234.3!5 len:5 { "hello" }

text.del(0, 6);
console.log(text + '');
// StrApi
// └─ StrNode 1234.2 { "world" }
//    └─ StrChunk 1234.10!1 len:5 [1]
//       ← StrChunk 1234.3!5 len:0 [5]
//       → StrChunk 1234.11!5 len:5 { "world" }

console.log(model.view());
// { text: 'world' }
