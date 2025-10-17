import {RandomJson} from '@jsonjoy.com/util/lib/json-random';
import {RespEncoder} from '../RespEncoder';
import {RespDecoder} from '../RespDecoder';

const encoder = new RespEncoder();
const decoder = new RespDecoder();

describe('fuzzing', () => {
  test('CborEncoderFast', () => {
    for (let i = 0; i < 2000; i++) {
      const value = JSON.parse(JSON.stringify(RandomJson.generate()));
      const encoded = encoder.encode(value);
      const decoded = decoder.read(encoded);
      expect(decoded).toStrictEqual(value);
    }
  });
});
