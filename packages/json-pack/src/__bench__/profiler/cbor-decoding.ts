// NODE_ENV=production node --prof -r ts-node/register src/__bench__/profiler/cbor-decoding.ts
// node --prof-process isolate-0xnnnnnnnnnnnn-v8.log > processed.txt

import {CborEncoder} from '../../cbor/CborEncoder';
import {CborDecoder} from '../../cbor/CborDecoder';

const payload = [
  0, 1, 2, 333, -333, 44444, -55555, 556666, -6666666, 62343423432, 0.123, 0.0, -123.3434343, 127, 128, 129, 255, 256,
  257, 258, 1000, 1000, 1000, -222222, -22222, 0xff, 0xfe, 0x100,
  0x101,
  // 0xffff, 0xfffe, 0x10000, -0x7f, -0x80, -0x81, -0x100, -0x101, -0x10000,
  // 0xffffffff, 0xfffffffe, 0x100000000, 0x100000001, 0xffffffffffffffff,
  // 0xfffffffffffffffe, 0x10000000000000000, 0x10000000000000001,
  // 0x100000000000000000, 0x100000000000000001, 0x1000000000000000000,
];
const encoded = new CborEncoder().encode(payload);
const decoder = new CborDecoder();

for (let i = 0; i < 10e6; i++) {
  decoder.read(encoded);
}
