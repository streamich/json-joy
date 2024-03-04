/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt-extensions/mval/__demos__/usage.ts
 */

import {Model} from '../../../json-crdt';
import {ValueMvExt} from '..';

console.clear();

const model = Model.withLogicalClock(1234);

model.ext.register(ValueMvExt)

model.api.root({
  obj: {
    mv: ValueMvExt.new(1),
  },
});

console.log('');
console.log('Initial value:');
console.log(model + '');

const api = model.api.in(['obj', 'mv']).asExt(ValueMvExt);

api.set(5);

console.log('');
console.log('After update:');
console.log(model + '');

const model2 = model.fork();

const api2 = model2.api.in(['obj', 'mv']).asExt(ValueMvExt);

api.set(10);
api2.set(20);
model.applyPatch(model2.api.flush());

console.log('');
console.log('After two users update concurrently:');
console.log(model + '');
