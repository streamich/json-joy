/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt-extensions/mval/__demos__/usage.ts
 */

import {Model, s} from '../../../json-crdt';
import {MvalExt} from '..';

console.clear();

const model = Model.withLogicalClock(1234);

model.ext.register(MvalExt);

model.api.set({
  obj: {
    name: s.con('John'),
    score: MvalExt.new(s.con(1)),
  },
});

console.log('');
console.log('Initial value:');
console.log(model + '');

const api = model.api.in(['obj', 'score']).asExt(MvalExt);

api.set(s.con(5));

console.log('');
console.log('After update:');
console.log(model + '');

const model2 = model.fork();

const api2 = model2.api.in(['obj', 'score']).asExt(MvalExt);

api.set(s.con(10));
api2.set(s.con(20));
model.applyPatch(model2.api.flush());

console.log('');
console.log('After two users update concurrently:');
console.log(model + '');
