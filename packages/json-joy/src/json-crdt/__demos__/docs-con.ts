/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/docs-con.ts
 */

import {Model, s} from '..';
import {Timestamp} from '../../json-crdt-patch/clock';

const model = Model.create(void 0, 1234);
model.api.set({
  num: 123,
  bool: true,
  nil: null,
});

console.log(model.view());
console.log(model.toString());

model.api.set({
  str: 'hello',
  obj: {foo: 'bar'},
  arr: [1],
});
console.log(model + '');
console.log(model.view());

model.api.set({
  str: s.con('hello'),
  obj: s.con({foo: 'bar'}),
  arr: s.con([1]),
});
console.log(model + '');
console.log(model.view());

model.api.set({
  undef: undefined,
  stamp: s.con(new Timestamp(1234, 5678)),
});
console.log(model + '');
console.log(model.view());

model.api.set({
  foo: {
    bar: 42,
  },
});
console.log(model + '');
console.log(model.view());

const conApi = model.api.con(['foo', 'bar']);
console.log(conApi.view());
console.log(conApi.node.toString());
