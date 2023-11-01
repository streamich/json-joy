/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/docs-str.ts
 */

import {Model} from '..';

const model = Model.withLogicalClock(1234); // 1234 is session ID

model.api.root({
  text: 'hello',
});

console.log(model.root + '');
// RootLww "val" 0.0
// └─ ObjectLww "obj" 1234.1
//    └─ "text"
//        └─ StringRga "str" 1234.2 { "hello" }
//           └─ StringChunk 1234.3!5 len:5 { "hello" }

console.log(model.view());
// { text: 'hello' }

// Retrieve node at path ['text'] as "str" type.
const bar = model.api.str(['text']);
console.log(bar + '');
// StringApi
// └─ StringRga "str" 1234.2 { "hello" }
//    └─ StringChunk 1234.3!5 len:5 { "hello" }

bar.ins(5, ' world');
console.log(bar + '');
// StringApi
// └─ StringRga "str" 1234.2 { "hello world" }
//    └─ StringChunk 1234.10!6 len:11 { " world" }
//       ← StringChunk 1234.3!5 len:5 { "hello" }


bar.del(0, 6);
console.log(bar + '');
// StringApi
// └─ StringRga "str" 1234.2 { "world" }
//    └─ StringChunk 1234.10!1 len:5 [1]
//       ← StringChunk 1234.3!5 len:0 [5]
//       → StringChunk 1234.11!5 len:5 { "world" }

console.log(model.view());
// { text: 'world' }
