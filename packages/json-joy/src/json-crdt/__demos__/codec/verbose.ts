/* tslint:disable no-console */

// Run this demo with:
// npx nodemon -q -x ts-node src/json-crdt/__demos__/codec/verbose.ts

import {Model} from '../..';
import {Encoder} from '../../codec/structural/verbose/Encoder';
import {inspect} from 'util';

const encoder = new Encoder();
const model = Model.create(void 0, 123);

model.api.set({
  time: 123456,
  name: 'Vadim',
  verified: true,
  tags: [],
});

console.clear();
console.log('');
console.log(model.toString());
console.log('');
console.log('View:');
console.log(model.view());
console.log('');
console.log('"verbose" encoded:');
const json = encoder.encode(model);
console.log(inspect(json, false, 20, true));
console.log('');
console.log('View size:', JSON.stringify(model.view()).length);
console.log('"verbose" size:', JSON.stringify(json).length);
console.log('"binary" size:', model.toBinary().length);
