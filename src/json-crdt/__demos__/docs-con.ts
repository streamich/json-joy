/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/docs-con.ts
 */

import {Model} from '..';
import {konst} from '../../json-crdt-patch';
import {Timestamp} from '../../json-crdt-patch/clock';

const model = Model.withLogicalClock(1234);
model.api.root({
  num: 123,
  bool: true,
  nil: null,
});

console.log(model.view());
console.log(model.toString());

model.api.root({
  str: 'hello',
  obj: {foo: 'bar'},
  arr: [1],
});
console.log(model + '');
console.log(model.view());

model.api.root({
  str: konst('hello'),
  obj: konst({foo: 'bar'}),
  arr: konst([1]),
});
console.log(model + '');
console.log(model.view());

model.api.root({
  undef: undefined,
  stamp: konst(new Timestamp(1234, 5678)),
});
console.log(model + '');
console.log(model.view());

model.api.root({
  foo: {
    bar: 42,
  },
});
console.log(model + '');
console.log(model.view());

const conApi = model.api.const(['foo', 'bar']);
console.log(conApi.view());
console.log(conApi.node.toString());
