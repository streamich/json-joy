import {RandomJson} from '@jsonjoy.com/util/lib/json-random';
import {CborEncoderFast} from '../CborEncoderFast';
import {CborEncoder} from '../CborEncoder';
import {CborEncoderStable} from '../CborEncoderStable';
import {CborEncoderDag} from '../CborEncoderDag';
import {CborDecoder} from '../CborDecoder';

const decoder = new CborDecoder();

describe('fuzzing', () => {
  test('CborEncoderFast', () => {
    const encoder = new CborEncoderFast();
    for (let i = 0; i < 200; i++) {
      const value = RandomJson.generate();
      const encoded = encoder.encode(value);
      const decoded = decoder.read(encoded);
      expect(decoded).toStrictEqual(value);
    }
  });

  test('CborEncoder', () => {
    const encoder = new CborEncoder();
    for (let i = 0; i < 200; i++) {
      const value = RandomJson.generate();
      const encoded = encoder.encode(value);
      const decoded = decoder.read(encoded);
      expect(decoded).toStrictEqual(value);
    }
  });

  test('CborEncoderStable', () => {
    const encoder = new CborEncoderStable();
    for (let i = 0; i < 200; i++) {
      const value = RandomJson.generate();
      const encoded = encoder.encode(value);
      const decoded = decoder.read(encoded);
      expect(decoded).toStrictEqual(value);
    }
  });

  test('CborEncoderDag', () => {
    const encoder = new CborEncoderDag();
    for (let i = 0; i < 200; i++) {
      const value = RandomJson.generate();
      const encoded = encoder.encode(value);
      const decoded = decoder.read(encoded);
      expect(decoded).toStrictEqual(value);
    }
  });
});
