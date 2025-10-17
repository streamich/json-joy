import {MsgPackEncoderFast} from '../MsgPackEncoderFast';
import {MsgPackDecoderFast} from '../MsgPackDecoderFast';

const encoder = new MsgPackEncoderFast();
const decoder = new MsgPackDecoderFast();
const encode = (x: unknown) => encoder.encode(x);
const decode = (arr: Uint8Array) => decoder.decode(arr);

test('does not overwrite previous buffer', () => {
  const buf1 = encode(true);
  const buf2 = encode(false);
  const val1 = decode(buf1);
  const val2 = decode(buf2);
  expect(val1).toBe(true);
  expect(val2).toBe(false);
});
