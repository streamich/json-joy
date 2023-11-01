/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/schema.ts
 */

import {Model} from '..';
import {s, nodes} from '../../json-crdt-patch/builder/schema';

const model = Model.withLogicalClock(1234);


const mySchema = s.obj({
  id: s.con(''),
  counter: s.con(0),
  bool: s.con(true),
  nil: s.con(null),
  undef: s.con(undefined),
  arr: s.arr([
    s.val(s.con(1)),
    s.val(s.con(2)),
    s.val(s.con(3)),
  ]),
  polymorphicArr: s.arr([
    s.con(1),
    s.val(s.con('asdf')),
    s.str('hello'),
  ]),
  vec: s.vec(
    s.con(123),
    s.con('<div>'),
  ),
  obj: s.obj({
    num: s.con(123),
    str: s.str('hello'),
  }),
}, {
  verified: s.con(false),
}).optional<{
  num: nodes.con<number>;
}>();


model.api.root(mySchema);

console.log(model + '');
