import {utf8Size} from '../../strings/utf8';

export const testJsonSize = (
  jsonSize: (val: unknown) => number,
  {simpleStringsOnly = false}: {simpleStringsOnly?: boolean} = {},
) => {
  test('calculates null size', () => {
    expect(jsonSize(null)).toBe(4);
  });

  test('calculates boolean sizes', () => {
    expect(jsonSize(true)).toBe(4);
    expect(jsonSize(false)).toBe(5);
  });

  test('calculates number sizes', () => {
    expect(jsonSize(1)).toBe(1);
    expect(jsonSize(1.1)).toBe(3);
    expect(jsonSize(0)).toBe(1);
    expect(jsonSize(1.123)).toBe(5);
    expect(jsonSize(-1.123)).toBe(6);
  });

  if (!simpleStringsOnly) {
    test('calculates string sizes', () => {
      expect(jsonSize('')).toBe(2);
      expect(jsonSize('a')).toBe(3);
      expect(jsonSize('abc')).toBe(5);
      expect(jsonSize('👨‍👩‍👦‍👦')).toBe(27);
      expect(jsonSize('büro')).toBe(7);
      expect(jsonSize('office')).toBe(8);
    });
  }

  if (!simpleStringsOnly) {
    test('calculates string sizes with escaped characters', () => {
      expect(jsonSize('\\')).toBe(4);
      expect(jsonSize('"')).toBe(4);
      expect(jsonSize('\b')).toBe(4);
      expect(jsonSize('\f')).toBe(4);
      expect(jsonSize('\n')).toBe(4);
      expect(jsonSize('\r')).toBe(4);
      expect(jsonSize('\t')).toBe(4);
    });
  }

  test('calculates array sizes', () => {
    expect(jsonSize([])).toBe(2);
    expect(jsonSize([1])).toBe(3);
    expect(jsonSize([1, 2, 3])).toBe(7);
    expect(jsonSize([1, 'büro', 3])).toBe(13);
  });

  test('calculates object sizes', () => {
    expect(jsonSize({})).toBe(2);
    expect(jsonSize({a: 1})).toBe(2 + 3 + 1 + 1);
    expect(jsonSize({1: 2, foo: 'bar'})).toBe(2 + 3 + 1 + 1 + 1 + 5 + 1 + 5);
  });

  test('calculates size of array of length 2 that begins with empty string', () => {
    const json = ['', -1];
    const size1 = jsonSize(json);
    const size2 = utf8Size(JSON.stringify(json));
    expect(size1).toBe(size2);
  });
};
