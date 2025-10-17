/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt-extensions/cnt/__demos__/docs.ts
 */

import {Model} from '../../../json-crdt';
import {cnt} from '..';

console.clear();

const model = Model.create(void 0, 1234);

model.ext.register(cnt);

model.api.set({
  counter: cnt.new(1),
});
console.log(model + '');

// Excess use only ...
// 2-3 days for finding damages ...
// ..

const api = model.api.in(['counter']).asExt(cnt);
const values = api.view();

console.log(values);

api.inc(10);

console.log(model + '');
