/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/events-level0.ts
 */

// Clear terminal.
console.clear();

// Import all necessary dependencies.
import {Model, PatchBuilder} from '..';

// Create a new JSON CRDT document.
const model = Model.create(void 0, 1234); // 1234 is the session ID

// Clone the model now for future reset.
const model0 = model.clone();

// Attach event listeners.
model.onbeforepatch = (patch) => {
  console.log('Called: "onbeforepatch" ' + patch);
};
model.onpatch = (patch) => {
  console.log('Called: "onpatch" ' + patch);
};
model.onbeforereset = () => {
  console.log('Called: "onbeforereset"');
};
model.onreset = () => {
  console.log('Called: "onreset"');
};

// Construct a JSON CRDT Patch which sets the document value to `123`.
const builder = new PatchBuilder(model.clock);
builder.root(builder.const(123));
const patch = builder.flush();

// Print out the document state.
console.log('Document state #1:');
console.log(model + '');

// Apply the patch to the model.
console.log('');
model.applyPatch(patch);
console.log('');

// Print out the document state.
console.log('Document state #2:');
console.log(model + '');

// Reset the model to the initial state.
console.log('');
model.reset(model0);
console.log('');

// Print out the document state.
console.log('Document state #3:');
console.log(model + '');
