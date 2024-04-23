import {t} from '../..';
import {ResolveType} from '../../../system';

describe('.extend()', () => {
  test('can extend an object', () => {
    const obj1 = t.Object(t.prop('a', t.str));
    const obj2 = t.Object(t.prop('b', t.num));
    const obj3 = obj1.extend(obj2);
    expect(typeof obj1.getField('a')).toBe('object');
    expect(typeof obj1.getField('b' as any)).toBe('undefined');
    expect(typeof obj2.getField('a' as any)).toBe('undefined');
    expect(typeof obj2.getField('b')).toBe('object');
    expect(typeof obj3.getField('a')).toBe('object');
    expect(typeof obj3.getField('b')).toBe('object');
    const val1: ResolveType<typeof obj1> = {
      a: 'hello',
    };
    const val2: ResolveType<typeof obj2> = {
      b: 123,
    };
    const val3: ResolveType<typeof obj3> = {
      a: 'hello',
      b: 123,
    };
  });

  test('can extend an empty object', () => {
    const obj1 = t.Object();
    const obj2 = t.Object(t.prop('b', t.num));
    const obj3 = obj1.extend(obj2);
    expect(typeof obj1.getField('b')).toBe('undefined');
    expect(typeof obj2.getField('b')).toBe('object');
    expect(typeof obj3.getField('b')).toBe('object');
    const val1: ResolveType<typeof obj1> = {};
    const val2: ResolveType<typeof obj2> = {
      b: 123,
    };
    const val3: ResolveType<typeof obj3> = {
      b: 123,
    };
  });
});

describe('.omit()', () => {
  test('can remove a field from an object', () => {
    const obj1 = t.Object(t.prop('a', t.str), t.prop('b', t.num));
    const obj2 = obj1.omit('b');
    expect(typeof obj1.getField('a')).toBe('object');
    expect(typeof obj1.getField('b')).toBe('object');
    expect(typeof obj2.getField('a')).toBe('object');
    expect(typeof obj2.getField('b' as any)).toBe('undefined');
    const val1: ResolveType<typeof obj1> = {
      a: 'hello',
      b: 123,
    };
    const val2: ResolveType<typeof obj2> = {
      a: 'hello',
    };
  });
});

describe('.pick()', () => {
  test('can pick a field from object', () => {
    const obj1 = t.Object(t.prop('a', t.str), t.prop('b', t.num));
    const obj2 = obj1.pick('a');
    const obj3 = obj1.pick('b');
    expect(typeof obj1.getField('a')).toBe('object');
    expect(typeof obj1.getField('b')).toBe('object');
    expect(typeof obj2.getField('a')).toBe('object');
    expect(typeof obj2.getField('b' as any)).toBe('undefined');
    expect(typeof obj3.getField('a' as any)).toBe('undefined');
    expect(typeof obj3.getField('b')).toBe('object');
    const val1: ResolveType<typeof obj1> = {
      a: 'hello',
      b: 123,
    };
    const val2: ResolveType<typeof obj2> = {
      a: 'hello',
    };
    const val3: ResolveType<typeof obj3> = {
      b: 123,
    };
  });
});
