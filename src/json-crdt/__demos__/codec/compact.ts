/* tslint:disable no-console */

// Run this demo with:
// npx nodemon -q -x ts-node src/json-crdt/__demos__/codec/compact.ts

import {Model} from '../..';
import {Encoder} from '../../codec/structural/compact/Encoder';
import {Encoder as EncoderCompactBinary} from '../../codec/structural/compact-binary/Encoder';
import {inspect} from 'util';

const encoder = new Encoder();
const encoderCompactBinary = new EncoderCompactBinary();
const model = Model.withLogicalClock(123);

model.api.set({
  time: 123,
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
console.log('"compact" encoded:');
const json = encoder.encode(model);
console.log(inspect(json, false, 20, true));
console.log('');
console.log('View size:', JSON.stringify(model.view() || null).length);
console.log('"compact" size:', JSON.stringify(json).length);
console.log('"compact-binary" size:', encoderCompactBinary.encode(model).length);
console.log('"binary" size:', model.toBinary().length);
