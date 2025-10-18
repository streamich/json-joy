import {testcases} from './cbor-js-testcases';
import {CborEncoder} from '../CborEncoder';
import {CborDecoder} from '../CborDecoder';
import {JsonPackExtension} from '../../JsonPackExtension';
import {JsonPackValue} from '../../JsonPackValue';

const hex2arrayBuffer = (data: string): Uint8Array => {
  const length = data.length / 2;
  const ret = new Uint8Array(length);
  for (let i = 0; i < length; ++i) {
    ret[i] = parseInt(data.substr(i * 2, 2), 16);
  }
  return ret;
};

const run = (encoder: CborEncoder, decoder: CborDecoder) => {
  describe('JSON documents', () => {
    for (const [name, expected, value, binaryDifferences, error] of testcases) {
      test(name, () => {
        if (error === undefined) {
          const expectedBuf = hex2arrayBuffer(expected);
          const encoded = encoder.encode(value);
          const decoded = decoder.decode(encoded);
          if (!binaryDifferences) expect(encoded).toStrictEqual(expectedBuf);
          expect(decoded).toStrictEqual(value);
          const decoded2 = decoder.decode(expectedBuf);
          const resultValue =
            decoded2 instanceof JsonPackExtension
              ? decoded2.val
              : decoded2 instanceof JsonPackValue
                ? decoded2.val
                : decoded2;
          expect(resultValue).toStrictEqual(value);
        } else {
          expect(() => decoder.decode(hex2arrayBuffer(expected))).toThrow();
        }
      });
    }
  });
};

const encoder = new CborEncoder();
const decoder = new CborDecoder();

run(encoder, decoder);
