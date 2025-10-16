/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt-extensions/mval/__demos__/view.ts
 */

import {Model, s} from '../../../json-crdt';
import {MvalExt} from '..';

console.clear();

const model = Model.create(void 0, 1234);

model.ext.register(MvalExt);

model.api.set(MvalExt.new(s.con(1)));

console.log('');
console.log('Model with extension:');
console.log(model + '');

const model2 = Model.fromBinary(model.toBinary());

console.log('');
console.log('Model not aware of extension:');
console.log(model2 + '');
