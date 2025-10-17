/* tslint:disable no-console */

import {MsgPackEncoderFast} from '../../msgpack/MsgPackEncoderFast';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';

const _json = [1234];

const writer = new Writer();
const _encoder = new MsgPackEncoderFast();

const arr = new ArrayBuffer(1024 * 4);
const _uint8 = new Uint8Array(arr);
const _buf = Buffer.alloc(1024 * 4);

console.time('loop');
for (let i = 0; i < 10000000; i++) {
  writer.utf8('asdf');
  writer.u8(123);
  // writer.u8u32(123, 123123);
  writer.reset();
  // writer.flush();
  // arr.slice(i % 1024, i % 1024 + 1);
  // buf.slice(i % 1024, i % 1024 + 1);
  // (buf as any).hexSlice(i % 1024, i % 1024 + 1);
  // const pos = i % 1024;
  // new Slice(uint8, pos, pos + 1);
  // uint8.subarray(pos, pos + 1);
  // new Uint8Array(arr.buffer, arr.byteOffset + pos, 1);
  // arr.slice(pos, pos + 1);
}
console.timeEnd('loop');
