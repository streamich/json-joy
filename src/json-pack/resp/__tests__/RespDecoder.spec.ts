import {RespEncoder} from '../RespEncoder';
import {RespDecoder} from '../RespDecoder';

const assertCodec = (value: unknown, expected: unknown = value): void => {
  const encoder = new RespEncoder();
  const encoded = encoder.encode(value);
  const decoder = new RespDecoder();
  const decoded = decoder.read(encoded);
  expect(decoded).toEqual(expected);
};

describe('strings', () => {
  describe('simple strings', () => {
    test('empty string', () => {
      assertCodec('');
    });

    test('short string', () => {
      assertCodec('foo bar');
    });
  });
});
