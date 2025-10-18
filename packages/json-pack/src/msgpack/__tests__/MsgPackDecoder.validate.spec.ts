import {MsgPackEncoder} from '../MsgPackEncoder';
import {MsgPackDecoder} from '../MsgPackDecoder';

const encoder = new MsgPackEncoder();
const decoder = new MsgPackDecoder();

test('value is too short, buffer too long', () => {
  const encoded = encoder.encode(1.1);
  decoder.validate(encoded);
  const corrupted = new Uint8Array(encoded.length + 1);
  corrupted.set(encoded);
  expect(() => decoder.validate(corrupted)).toThrow();
});

test('value is truncated, buffer too short', () => {
  const encoded = encoder.encode(1.1);
  decoder.validate(encoded);
  const corrupted = encoded.subarray(0, encoded.length - 1);
  expect(() => decoder.validate(corrupted)).toThrow();
});

test('invalid value', () => {
  const encoded = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
  expect(() => decoder.validate(encoded)).toThrow();
});
