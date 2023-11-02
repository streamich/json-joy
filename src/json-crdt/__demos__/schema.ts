/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/schema.ts
 */

import {Model} from '..';
import {s} from '../../json-crdt-patch';

const schema = s.obj({
  text: s.con('hello'),
  counter: s.con(0),
  checked: s.con(true),
  friend: s.obj({
    name: s.con('John'),
    age: s.con(42),
    tags: s.arr([s.con('foo'), s.con('bar')]),
  }),
});

const model = Model.withLogicalClock(1234).setSchema(schema);

console.log(model + '');
// Model
// ├─ RootLww "val" 0.0
// │  └─ ObjectLww "obj" 1234.1
// │     ├─ "text"
// │     │   └─ Const "con" 1234.2 { "hello" }
// │     ├─ "counter"
// │     │   └─ Const "con" 1234.3 { 0 }
// │     ├─ "checked"
// │     │   └─ Const "con" 1234.4 { true }
// │     └─ "friend"
// │         └─ ObjectLww "obj" 1234.5
// │            ├─ "name"
// │            │   └─ Const "con" 1234.6 { "John" }
// │            ├─ "age"
// │            │   └─ Const "con" 1234.7 { 42 }
// │            └─ "tags"
// │                └─ ArrayRga "arr" 1234.8
// │                   └─ ArrayChunk 1234.11!2 len:2
// │                      ├─ [0]: Const "con" 1234.9 { "foo" }
// │                      └─ [1]: Const "con" 1234.10 { "bar" }
// │
// └─ VectorClock 1234.16


console.log(model.view().friend.name);
// "John"
console.log(model.view().friend.tags[1]);
// "bar"


console.log(model.api.node.get('text').view());
// "hello"
console.log(model.api.node.get('friend').get('name').view());
// "John"
