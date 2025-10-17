/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node src/json-crdt/__demos__/toString-object.ts
 */

import {Model} from '..';

const model = Model.withServerClock();

console.log('');
console.log('Empty document:');
console.log('');
console.log(model.toString());

model.api.set({});

console.log('');
console.log('Object as document root:');
console.log('');
console.log(model.toString());

model.api.obj([]).set({
  id: 'xxxxxx-xxx-xxx',
  name: 'John Doe',
  age: 42,
});

console.log('');
console.log('After adding fields to the object:');
console.log('');
console.log(model.toString());

model.api.str(['name']).ins(4, 'y,');

console.log('');
console.log('After editing /name string:');
console.log('');
console.log(model.toString());

model.api.obj([]).set({
  address: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zip: '12345',
  },
});

console.log('');
console.log('After adding a nested object:');
console.log('');
console.log(model.toString());

const obj = model.api.obj([]);
obj.set({
  about: 'I am a software engineer. I like to write code. (Codepilot wrote this demo.)',
  verified: true,
  sex: null,
});
obj.val(['age']);
obj.set(18);

console.log('');
console.log('Editing /name field a bit more:');
console.log('');
console.log(model.toString());

const name = model.api.str(['name']);
name.del(7, 3);
name.ins(7, 'Bravo!');
name.ins(0, '💪 ');

console.log('');
console.log('After some more name editing:');
console.log('');
console.log(model.toString());
console.log('');
console.log('Final document view:');
console.log('');
console.log(model.view());
