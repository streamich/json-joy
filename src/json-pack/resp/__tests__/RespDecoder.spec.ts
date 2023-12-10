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

const stringCases: [string, string][] = [
  ['empty string', ''],
  ['short string', 'foo bar'],
  ['short string with emoji', 'foo bar🍼'],
  ['short string with emoji and newline', 'foo bar\n🍼'],
  ['simple string with newline', 'foo\nbar'],
];

describe('strings', () => {
  for (const [name, value] of stringCases) {
    test(name, () => assertCodec(value));
  }
});

describe('binary', () => {
  test('empty blob', () => assertCodec(new Uint8Array(0)));
  test('small blob', () => assertCodec(new Uint8Array([1, 2, 3])));
  test('blob with new lines', () => assertCodec(new Uint8Array([1, 2, 3, 10, 13, 14, 64, 65])));
});

describe('errors', () => {
  for (const [name, value] of stringCases) {
    test(name, () => assertCodec(new Error(value)));
  }
});

