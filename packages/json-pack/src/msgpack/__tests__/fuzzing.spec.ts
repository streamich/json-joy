import {encode} from '@msgpack/msgpack';
import {RandomJson} from '@jsonjoy.com/util/lib/json-random';
import {MsgPackEncoderFast} from '../MsgPackEncoderFast';
import {MsgPackDecoderFast} from '../MsgPackDecoderFast';

const encoder1 = new MsgPackEncoderFast();
const decoder1 = new MsgPackDecoderFast();

test('fuzzing', () => {
  for (let i = 0; i < 200; i++) {
    const value = RandomJson.generate();
    const encoded1 = encoder1.encode(value);
    const decoded1 = decoder1.decode(encoded1);
    const encoded2 = encode(value);
    const decoded2 = decoder1.decode(encoded2);
    expect(decoded1).toStrictEqual(value);
    expect(decoded2).toStrictEqual(value);
  }
});
