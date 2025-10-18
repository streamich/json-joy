/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x npx ts-node src/__demos__/msgpack.ts
 */

import {MsgPackEncoder} from '../msgpack/MsgPackEncoder';
import {MsgPackDecoder} from '../msgpack/MsgPackDecoder';

const encoder = new MsgPackEncoder();
const decoder = new MsgPackDecoder();

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
console.log('Encoding MessagePack:');
const encoded = encoder.encode(pojo);
console.log(encoded);

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
