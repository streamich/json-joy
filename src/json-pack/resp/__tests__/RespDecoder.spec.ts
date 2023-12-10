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
  // console.log(Buffer.from(encoded).toString());
  const decoded = decode(encoded);
  expect(decoded).toEqual(expected);
};

describe('nulls', () => {
  test('null', () => {
    assertCodec(null);
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

describe('integers', () => {
  test('zero', () => assertCodec(0));
  test('positive', () => assertCodec(123));
  test('negative', () => assertCodec(-2348934));
  test('positive with leading "+"', () => {
    const decoded = decode(':+123\r\n');
    expect(decoded).toBe(123);
  });
});

describe('big ints', () => {
  test('zero', () => assertCodec(BigInt('0')));
  test('positive', () => assertCodec(BigInt('123')));
  test('negative', () => assertCodec(BigInt('-2348934')));
  test('positive with leading "+"', () => {
    const decoded = decode('(+123\r\n');
    expect(decoded).toEqual(BigInt('123'));
  });
});

describe('floats', () => {
  test('positive', () => assertCodec([1.123]));
  test('negative', () => assertCodec([-43.234435]));
  test('negative', () => assertCodec([-5445e-10]));
  test('negative', () => assertCodec([-5445e-20]));
  test('negative', () => assertCodec([-5445e-30]));
  test('inf', () => assertCodec([Infinity]));
  test('-inf', () => assertCodec([-Infinity]));
  test('nan', () => assertCodec([NaN]));

  test('decodes ",inf<CR><LF>"', () => {
    const decoded = decode(',inf\r\n');
    expect(decoded).toEqual(Infinity);
  });

  test('decodes ",-inf<CR><LF>"', () => {
    const decoded = decode(',-inf\r\n');
    expect(decoded).toEqual(-Infinity);
  });

  test('decodes ",nan<CR><LF>"', () => {
    const decoded = decode(',nan\r\n');
    expect(decoded).toEqual(NaN);
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

describe('arrays', () => {
  test('empty array', () => assertCodec([]));
  test('simple array', () => assertCodec([1, 2, 3]));
  test('with strings', () => assertCodec(['foo', 'bar']));
  test('nested', () => assertCodec([[]]));
  test('surrounded by special strings', () => assertCodec(['a\n', 'b😱', [0, -1, 1], '\nasdf\r\n\r💪\nadsf']));
});

describe('sets', () => {
  test('empty set', () => assertCodec(new Set([])));
  test('simple set', () => assertCodec(new Set([1, 2, 3])));
  test('with strings', () => assertCodec(new Set(['foo', 'bar'])));
  test('nested', () => assertCodec(new Set([new Set([])])));
  test('surrounded by special strings', () => assertCodec(new Set(['a\n', 'b😱', [0, -1, 1], '\nasdf\r\n\r💪\nadsf'])));
});
