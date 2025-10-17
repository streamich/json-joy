/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt-extensions/mval/__demos__/docs.ts
 */

import {Model, s} from '../../../json-crdt';
import {mval} from '..';

console.clear();

const model = Model.create(void 0, 1234);

model.ext.register(mval);

model.api.set({
  score: mval.new(1),
});
console.log(model + '');

const api = model.api.in(['score']).asExt(mval);
const values = api.view();

console.log(values);

api.set(s.con(2));

console.log(model + '');
