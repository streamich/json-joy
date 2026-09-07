import {CborDecoder} from '../CborDecoder';
import {CborEncoder} from '../CborEncoder';
import {hexToUint8Array} from './rfc8949-vectors';

const decoder = new CborDecoder();
const encoder = new CborEncoder();

const findValue = (encoded: Uint8Array, path: (string | number)[]): unknown => {
  decoder.reader.reset(encoded);
  return decoder.find(path).val();
};

describe('findKey()', () => {
  test('finds a key in a definite length map', () => {
    const encoded = encoder.encode({a: 1, b: 'two', c: [3]});
    expect(findValue(encoded, ['a'])).toBe(1);
    expect(findValue(encoded, ['b'])).toBe('two');
    expect(findValue(encoded, ['c'])).toStrictEqual([3]);
  });

  test('finds a key in an indefinite length map', () => {
    // {_ "a": 1, "b": "two", "c": [3]}
    const encoded = hexToUint8Array('bf6161016162637477 6f6163 8103ff'.replace(/\s/g, ''));
    expect(decoder.decode(encoded)).toStrictEqual({a: 1, b: 'two', c: [3]});
    expect(findValue(encoded, ['a'])).toBe(1);
    expect(findValue(encoded, ['b'])).toBe('two');
    expect(findValue(encoded, ['c'])).toStrictEqual([3]);
  });

  test('throws when the key is missing from an indefinite length map', () => {
    const encoded = hexToUint8Array('bf61610162620 2ff'.replace(/\s/g, ''));
    expect(() => findValue(encoded, ['zzz'])).toThrow();
  });

  test('throws when the key is missing from a definite length map', () => {
    expect(() => findValue(encoder.encode({a: 1}), ['zzz'])).toThrow();
  });

  test('throws when the value is not a map', () => {
    expect(() => findValue(encoder.encode([1, 2]), ['a'])).toThrow();
  });

  test('skips over container values while searching', () => {
    const encoded = encoder.encode({a: {deep: [1, 2, {x: 'y'}]}, b: 42});
    expect(findValue(encoded, ['b'])).toBe(42);
  });
});

describe('findIndex()', () => {
  test('finds an index in a definite length array', () => {
    const encoded = encoder.encode([1, 'two', [3], {a: 4}]);
    expect(findValue(encoded, [0])).toBe(1);
    expect(findValue(encoded, [1])).toBe('two');
    expect(findValue(encoded, [2])).toStrictEqual([3]);
    expect(findValue(encoded, [3])).toStrictEqual({a: 4});
  });

  test('finds an index in an indefinite length array', () => {
    // [_ 1, "two", [3]]
    const encoded = hexToUint8Array('9f016374776f8103ff');
    expect(decoder.decode(encoded)).toStrictEqual([1, 'two', [3]]);
    expect(findValue(encoded, [0])).toBe(1);
    expect(findValue(encoded, [1])).toBe('two');
    expect(findValue(encoded, [2])).toStrictEqual([3]);
  });

  test('throws when the index is past the end of an indefinite length array', () => {
    const encoded = hexToUint8Array('9f0102ff');
    expect(() => findValue(encoded, [2])).toThrow();
    expect(() => findValue(encoded, [7])).toThrow();
  });

  test('throws when the index is past the end of a definite length array', () => {
    expect(() => findValue(encoder.encode([1, 2]), [2])).toThrow();
  });

  test('throws on an empty indefinite length array', () => {
    expect(() => findValue(hexToUint8Array('9fff'), [0])).toThrow();
  });

  test('throws when the value is not an array', () => {
    expect(() => findValue(encoder.encode({a: 1}), [0])).toThrow();
  });
});

describe('find()', () => {
  test('walks a mixed path', () => {
    const encoded = encoder.encode({users: [{name: 'ada'}, {name: 'alan'}]});
    expect(findValue(encoded, ['users', 1, 'name'])).toBe('alan');
  });

  test('walks a path through indefinite length containers', () => {
    // {_ "users": [_ {_ "name": "alan"}]}
    const encoded = hexToUint8Array('bf6575736572739fbf646e616d6564616c616effffff');
    expect(decoder.decode(encoded)).toStrictEqual({users: [{name: 'alan'}]});
    expect(findValue(encoded, ['users', 0, 'name'])).toBe('alan');
  });

  test('an empty path returns the value itself', () => {
    expect(findValue(encoder.encode({a: 1}), [])).toStrictEqual({a: 1});
  });
});
