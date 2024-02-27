/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/events-level0.ts
 */

console.clear();

import {Model, PatchBuilder} from '..';

const model = Model.withLogicalClock(1234); // 1234 is the session ID

model.onbeforepatch = (patch) => {
  console.log('Called: onbeforepatch ' + patch);
};

model.onpatch = (patch) => {
  console.log('Called: onpatch' + patch);
};

model.onbeforereset = () => {
  console.log('Called: onbeforereset');
};

model.onreset = () => {
  console.log('Called: onreset');
};

const model0 = model.clone();

const builder = new PatchBuilder(model.clock);
builder.root(builder.const(123));
const patch = builder.flush();

console.log(model + '');

console.log('');
model.applyPatch(patch);
console.log('');

console.log(model + '');

console.log('');
model.reset(model0);
console.log('');

console.log(model + '');
