import {RandomJson} from '@jsonjoy.com/json-random';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {EjsonEncoder} from '../EjsonEncoder';
import {EjsonDecoder} from '../EjsonDecoder';

const writer = new Writer(8);
const relaxedEncoder = new EjsonEncoder(writer, {canonical: false});
const decoder = new EjsonDecoder();

describe('fuzzing', () => {
  test('EjsonEncoder - Relaxed Mode (JSON compatibility)', () => {
    for (let i = 0; i < 200; i++) {
      const value = RandomJson.generate();
      const encoded = relaxedEncoder.encode(value);
      const decoded = decoder.decode(encoded);
      expect(decoded).toStrictEqual(value);
    }
  });
});
