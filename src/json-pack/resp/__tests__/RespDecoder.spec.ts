import {RespEncoder} from '../RespEncoder';
import {RespDecoder} from '../RespDecoder';
import {bufferToUint8Array} from '../../../util/buffers/bufferToUint8Array';

const decode = (encoded: string | Uint8Array): unknown => {
  const decoder = new RespDecoder();
  const buf = typeof encoded === 'string' ? bufferToUint8Array(Buffer.from(encoded)) : encoded;
  const decoded = decoder.read(buf);
  return decoded;
};

const assertCodec = (value: unknown, expected: unknown = value): void => {
  const encoder = new RespEncoder();
  const encoded = encoder.encode(value);
  const decoded = decode(encoded);
  expect(decoded).toEqual(expected);
};

describe('strings', () => {
  describe('simple strings', () => {
    test('empty string', () => assertCodec(''));
    test('short string', () => assertCodec('foo bar'));
    test('short string with emoji', () => assertCodec('foo bar🍼'));
    test('short string with emoji and newline', () => assertCodec('foo bar\n🍼'));

    test('simple string with newline', () => {
      assertCodec('foo\nbar');
    });
  });
});

describe('booleans', () => {
  test('true', () => {
    assertCodec(true);
  });

  test('false', () => {
    assertCodec(false);
  });
});

describe('nulls', () => {
  test('null', () => {
    assertCodec(null);
  });
});

describe('integers', () => {
  test('zero', () => assertCodec(0));
  test('positive', () => assertCodec(123));
  test('negative', () => assertCodec(-2348934));
  test('positive with leading "+"', () => {
    const decoded = decode(':+123\r\n');
    expect(decoded).toBe(123);
  });
});
