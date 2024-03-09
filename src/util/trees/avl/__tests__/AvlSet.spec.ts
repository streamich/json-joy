import {AvlSet} from '../AvlSet';

test('can add numbers to set', () => {
  const set = new AvlSet<number>();
  expect(set.size()).toBe(0);
  expect(set.has(1)).toBe(false);
  set.add(1);
  expect(set.size()).toBe(1);
  expect(set.has(1)).toBe(true);
  set.add(24);
  set.add(42);
  set.add(42);
  expect(set.size()).toBe(3);
  expect(set.has(24)).toBe(true);
  expect(set.has(42)).toBe(true);
  expect(set.has(25)).toBe(false);
});

test('can remove numbers from set', () => {
  const set = new AvlSet<number>();
  set.add(1);
  set.add(24);
  set.add(42);
  expect(set.has(1)).toBe(true);
  expect(set.has(24)).toBe(true);
  expect(set.has(42)).toBe(true);
  set.del(24);
  expect(set.has(1)).toBe(true);
  expect(set.has(24)).toBe(false);
  expect(set.has(42)).toBe(true);
  set.del(1);
  expect(set.has(1)).toBe(false);
  expect(set.has(24)).toBe(false);
  expect(set.has(42)).toBe(true);
  expect(set.size()).toBe(1);
  set.del(42);
  expect(set.has(1)).toBe(false);
  expect(set.has(24)).toBe(false);
  expect(set.has(42)).toBe(false);
  expect(set.size()).toBe(0);
});

test('can store structs', () => {
  class Struct {
    constructor(
      public x: number,
      public y: number,
    ) {}
  }
  const set = new AvlSet<Struct>((a, b) => {
    const dx = a.x - b.x;
    return dx === 0 ? a.y - b.y : dx;
  });
  set.add(new Struct(0, 0));
  set.add(new Struct(0, 1));
  expect(set.size()).toBe(2);
  set.del(new Struct(0, 0));
  expect(set.size()).toBe(1);
  expect(set.has(new Struct(0, 0))).toBe(false);
  expect(set.has(new Struct(0, 1))).toBe(true);
  set.add(new Struct(2, 3));
  set.add(new Struct(3, 3));
  expect(set.size()).toBe(3);
  expect(set.has(new Struct(3, 3))).toBe(true);
  expect(set.has(new Struct(2, 3))).toBe(true);
});
