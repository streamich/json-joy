/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/toString-array.ts
 */

import {Model} from '..';
import {vec} from '../../json-crdt-patch/builder/Tuple';

const model = Model.withLogicalClock(123);

model.api.set(1);
model.api.set(2);
model.api.set(3);
model.api.set('');
model.api.set('abc');
model.api.set({
  foo: 'abc',
  bar: true,
  baz: 123,
  qux: vec(1, 'a', 'asf'),
});

const str = model.api.str(['foo']);

str.ins(3, 'def').ins(6, 'ghi').del(1, 2);

model.api.obj([]).del(['baz']);
model.api.obj([]).set({
  arr: [
    1,
    2,
    3,
    4,
    {
      hello: 'worl',
    },
  ],
});

model.api.str(['arr', 4, 'hello']).ins(4, 'd');
model.api.str(['arr', 4, 'hello']).ins(5, '!');
model.api.str(['arr', 4, 'hello']).del(0, 1);
model.api.str(['arr', 4, 'hello']).ins(0, 'W');

model.api.arr(['arr']).ins(2, ['str']);

console.clear();
console.log(model.view());
console.log('');
console.log(model.toString());
