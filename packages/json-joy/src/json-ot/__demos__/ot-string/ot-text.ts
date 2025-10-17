/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node src/json-ot/__demos__/ot-string/ot-text.ts
 */

const {type} = require('ot-text');

const op1 = [1, 'a'];
const op2 = [3, 'b'];

// const op1 = [3, 'a'];
// const op2 = [3, 'b'];

const op3 = type.transform(op1, op2, 'left');
const op4 = type.transform(op2, op1, 'right');

console.log('op3', op3);
console.log('op4', op4);
