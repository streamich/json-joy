/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x npx ts-node src/__demos__/json.ts
 */

import {JsonEncoder} from '../json/JsonEncoder';
import {JsonDecoder} from '../json/JsonDecoder';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';

const encoder = new JsonEncoder(new Writer());
const decoder = new JsonDecoder();

const pojo = {
  id: 123,
  foo: 'bar',
  tags: ['a', 'b', 'c'],
  binary: new Uint8Array([1, 2, 3]),
};

console.clear();

console.log('--------------------------------------------------');
console.log('Encoding JSON:');
const encoded = encoder.encode(pojo);
console.log(encoded);

console.log('--------------------------------------------------');
console.log('Decoding JSON:');
const decoded = decoder.read(encoded);
console.log(decoded);

console.log('--------------------------------------------------');
console.log('Binary data:');
const blob = encoder.encode({binary: new Uint8Array([1, 2, 3])});
console.log(Buffer.from(blob).toString());
