/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x npx ts-node src/__demos__/cbor.ts
 */

import {CborEncoder} from '../cbor/CborEncoder';
import {CborDecoder} from '../cbor/CborDecoder';
import {CborDecoderBase} from '../cbor/CborDecoderBase';

const encoder = new CborEncoder();
const decoder = new CborDecoder();
const decoderBase = new CborDecoderBase();

const pojo = {
  id: 123,
  foo: 'bar',
  tags: ['a', 'b', 'c'],
  nested: {
    a: 1,
    b: 2,
    level2: {
      c: 3,
    },
  },
};

console.clear();

console.log('--------------------------------------------------');
console.log('Encoding CBOR:');
const encoded = encoder.encode(pojo);
console.log(encoded);

console.log('--------------------------------------------------');
console.log('Decoding CBOR:');
const decoded = decoderBase.read(encoded);
console.log(decoded);

console.log('--------------------------------------------------');
console.log('Retrieving values without parsing:');
decoder.reader.reset(encoded);
const id = decoder.find(['id']).readAny();
decoder.reader.reset(encoded);
const foo = decoder.find(['foo']).readAny();
decoder.reader.reset(encoded);
const secondTag = decoder.find(['tags', 1]).readAny();
decoder.reader.reset(encoded);
const nested = decoder.find(['nested', 'level2', 'c']).readAny();
console.log('id:', id, 'foo:', foo, 'secondTag:', secondTag, 'nested:', nested);

console.log('--------------------------------------------------');
console.log('Asserting by value type:');
decoder.reader.reset(encoded);
const tagAsString = decoder.find(['tags', 1]).readPrimitiveOrVal();
console.log({tagAsString});

console.log('--------------------------------------------------');
console.log('Parsing only one level:');
const decodedLevel = decoder.decodeLevel(encoded);
console.log(decodedLevel);
