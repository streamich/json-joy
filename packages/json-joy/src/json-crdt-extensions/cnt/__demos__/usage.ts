/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt-extensions/cnt/__demos__/usage.ts
 */

import {Model, s} from '../../../json-crdt';
import {CntExt} from '..';

console.clear();

const model = Model.create(void 0, 1234);

model.ext.register(CntExt);

model.api.set({
  cnt: CntExt.new(42),
});

console.log('');
console.log('Initial value:');
console.log(model + '');

const api = model.api.in(['cnt']).asExt(CntExt);

api.inc(10);

console.log('');
console.log('After update:');
console.log(model + '');
