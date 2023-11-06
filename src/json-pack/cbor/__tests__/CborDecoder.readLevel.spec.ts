import {CborEncoder} from '../CborEncoder';
import {CborDecoder} from '../CborDecoder';
import {JsonPackValue} from '../../JsonPackValue';

const encoder = new CborEncoder();
const decoder = new CborDecoder();

test('decodes a primitive as is', () => {
  const encoded = encoder.encode(1.1);
  const decoded = decoder.decodeLevel(encoded);
  expect(decoded).toBe(1.1);
});

test('decodes object with one level of values', () => {
  const value = {
    foo: 'bar',
    baz: true,
  };
  const encoded = encoder.encode(value);
  const decoded = decoder.decodeLevel(encoded);
  expect(decoded).toStrictEqual(value);
});

test('decodes nested objects and arrays as JsonPackValue, in object', () => {
  const value = {
    foo: 'bar',
    baz: true,
    arr: [1, 2, 3],
    obj: {
      a: 'b',
    },
  };
  const encoded = encoder.encode(value);
  const decoded = decoder.decodeLevel(encoded);
  expect(decoded).toMatchObject({
    foo: 'bar',
    baz: true,
    arr: expect.any(JsonPackValue),
    obj: expect.any(JsonPackValue),
  });
  const arr = decoder.decode((decoded as any).arr.val);
  expect(arr).toStrictEqual([1, 2, 3]);
  const obj = decoder.decode((decoded as any).obj.val);
  expect(obj).toStrictEqual({
    a: 'b',
  });
});

test('decodes array with one level of values', () => {
  const value = [1, 'foo', true];
  const encoded = encoder.encode(value);
  const decoded = decoder.decodeLevel(encoded);
  expect(decoded).toStrictEqual(value);
});

test('decodes nested objects and arrays as JsonPackValue, in array', () => {
  const value = [
    1,
    'foo',
    true,
    [1, 2, 3],
    {
      a: 'b',
    },
  ];
  const encoded = encoder.encode(value);
  const decoded = decoder.decodeLevel(encoded);
  expect(decoded).toMatchObject([1, 'foo', true, expect.any(JsonPackValue), expect.any(JsonPackValue)]);
  const arr = decoder.decode((decoded as any)[3].val);
  expect(arr).toStrictEqual([1, 2, 3]);
  const obj = decoder.decode((decoded as any)[4].val);
  expect(obj).toStrictEqual({
    a: 'b',
  });
});
