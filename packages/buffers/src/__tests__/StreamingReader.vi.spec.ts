import {StreamingReader} from '../StreamingReader';

test('can push and read', () => {
  const reader = new StreamingReader(4);
  reader.push(new Uint8Array([1, 2, 3]));
  expect(reader.u8()).toBe(1);
  reader.push(new Uint8Array([4, 5, 6]));
  expect(reader.u8()).toBe(2);
  expect(reader.u8()).toBe(3);
  expect(reader.u8()).toBe(4);
  expect(reader.u8()).toBe(5);
  expect(reader.u8()).toBe(6);
});

test('throws RangeError when reading out of bounds', () => {
  const reader = new StreamingReader(2);
  reader.push(new Uint8Array([1, 2, 3]));
  reader.u16();
  reader.u8();
  expect(() => reader.u8()).toThrow(RangeError);
});

test('throws RangeError when reading out of bounds - 2', () => {
  const reader = new StreamingReader();
  reader.push(new Uint8Array([1, 2, 3]));
  reader.u16();
  expect(() => reader.u16()).toThrow(RangeError);
});

test('throws RangeError when reading out of bounds - 3', () => {
  const reader = new StreamingReader(4);
  reader.push(new Uint8Array([1, 2, 3]));
  reader.u16();
  reader.push(new Uint8Array([4, 5]));
  expect(() => reader.u32()).toThrow(RangeError);
});

test('size shrinks as data is read', () => {
  const reader = new StreamingReader(4);
  expect(reader.size()).toBe(0);
  reader.push(new Uint8Array([1, 2, 3]));
  expect(reader.size()).toBe(3);
  expect(reader.u8()).toBe(1);
  expect(reader.size()).toBe(2);
  reader.push(new Uint8Array([4, 5, 6]));
  expect(reader.size()).toBe(5);
  expect(reader.u8()).toBe(2);
  expect(reader.size()).toBe(4);
  expect(reader.u8()).toBe(3);
  expect(reader.size()).toBe(3);
  expect(reader.u8()).toBe(4);
  expect(reader.size()).toBe(2);
  expect(reader.u8()).toBe(5);
  expect(reader.size()).toBe(1);
  expect(reader.u8()).toBe(6);
  expect(reader.size()).toBe(0);
});
