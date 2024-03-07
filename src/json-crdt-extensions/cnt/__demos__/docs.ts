/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt-extensions/cnt/__demos__/docs.ts
 */

import {Model, s} from '../../../json-crdt';
import {CntExt} from '..';

console.clear();

const model = Model.withLogicalClock(1234);

model.ext.register(CntExt);

model.api.root({
  counter: CntExt.new(1),
});
console.log(model + '');


const api = model.api.in(['counter']).asExt(CntExt);
const values = api.view();

console.log(values);

api.inc(10);

console.log(model + '');
