import {MsgPackEncoderStable} from '../MsgPackEncoderStable';
import {MsgPackDecoderFast} from '../MsgPackDecoderFast';

const encoder = new MsgPackEncoderStable();
const encode = (x: unknown) => encoder.encode(x);
const decoder = new MsgPackDecoderFast();
const decode = (a: Uint8Array) => decoder.decode(a);

test('encodes object the same regardless of key order', () => {
  const data1 = {a: 1, b: 2};
  const data2 = {b: 2, a: 1};
  const arr1 = encode(data1);
  const arr2 = encode(data2);
  expect(arr1).toStrictEqual(arr2);
  expect(decode(arr1)).toStrictEqual(decode(arr2));
  expect(arr1).toMatchInlineSnapshot(`
    Uint8Array [
      130,
      161,
      97,
      1,
      161,
      98,
      2,
    ]
  `);
});
