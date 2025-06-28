/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node src/json-crdt/__demos__/toString-string.ts
 */

import {Model} from '..';
import {ClockVector} from '../../json-crdt-patch/clock';

const str = Model.withLogicalClock(new ClockVector(1234, 0));

console.log('');
console.log('Empty document:');
console.log('');
console.log(str.toString());

str.api.set('');

console.log('');
console.log('String as document root:');
console.log('');
console.log(str.toString());

str.api.str([]).ins(0, 'Helo world');
// str.api.commit();

console.log('');
console.log('Set initial string value:');
console.log('');
console.log(str.toString());

str.api.str([]).ins(2, 'l').ins(10, '!');

console.log('');
console.log('After fixing errors in the string:');
console.log('');
console.log(str.toString());

str.api.str([]).ins(11, ', CRDTs');

console.log('');
console.log('After editing more text to the string:');
console.log('');
console.log(str.toString());
