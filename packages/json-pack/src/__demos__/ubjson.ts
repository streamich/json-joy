/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x npx ts-node src/__demos__/ubjson.ts
 */

import {UbjsonEncoder} from '../ubjson/UbjsonEncoder';
import {UbjsonDecoder} from '../ubjson/UbjsonDecoder';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';

const encoder = new UbjsonEncoder(new Writer());
const decoder = new UbjsonDecoder();

const pojo = {
  id: 123,
  foo: 'bar',
  tags: ['a', 'b', 'c'],
  binary: new Uint8Array([1, 2, 3]),
};

console.clear();

console.log('--------------------------------------------------');
console.log('Encoding UBJSON:');
const encoded = encoder.encode(pojo);
console.log(encoded);

console.log('--------------------------------------------------');
console.log('Decoding UBJSON:');
const decoded = decoder.read(encoded);
console.log(decoded);

console.log('--------------------------------------------------');
console.log('Binary data:');
const blob = encoder.encode({binary: new Uint8Array([1, 2, 3])});
console.log(Buffer.from(blob).toString());
