import {validate, append, normalize, apply} from '../StringType';
import {StringTypeOp} from '../types';

describe('validate()', () => {
  test('returns 0 on valid op', () => {
    expect(validate(['a'])).toBe(0);
    expect(validate([1, 'a'])).toBe(0);
    expect(validate([1, -1, 'a'])).toBe(0);
    expect(validate([1, -1, ['b'], 'a'])).toBe(0);
  });

  test('returns non-zero integer on invalid operation', () => {
    expect(validate([1])).not.toBe(0);
    expect(validate([0])).not.toBe(0);
    expect(validate([5])).not.toBe(0);
    expect(validate([1, 'a', 11])).not.toBe(0);
    expect(validate([1, -1, 'a', 'b'])).not.toBe(0);
    expect(validate([1, -1, 'a', ''])).not.toBe(0);
    expect(validate([''])).not.toBe(0);
    expect(validate([1, 2, -1, ['b'], 'a'])).not.toBe(0);
    expect(validate([1, -1, -3, ['b'], 'a'])).not.toBe(0);
    expect(validate([1, .3, ['b'], 'a'])).not.toBe(0);
    expect(validate([1, 0.3])).not.toBe(0);
    expect(validate([1, ''])).not.toBe(0);
    expect(validate([''])).not.toBe(0);
  });
});

describe('append()', () => {
  test('adds components to operation', () => {
    const op: StringTypeOp = [];
    append(op, 1);
    expect(op).toStrictEqual([1]);
    append(op, 0);
    expect(op).toStrictEqual([1]);
    append(op, 4);
    expect(op).toStrictEqual([5]);
    append(op, 'asdf');
    expect(op).toStrictEqual([5, 'asdf']);
    append(op, 'asdf');
    expect(op).toStrictEqual([5, 'asdfasdf']);
    append(op, -4);
    expect(op).toStrictEqual([5, 'asdfasdf', -4]);
    append(op, 0);
    expect(op).toStrictEqual([5, 'asdfasdf', -4]);
    append(op, -3);
    expect(op).toStrictEqual([5, 'asdfasdf', -7]);
    append(op, ['a']);
    expect(op).toStrictEqual([5, 'asdfasdf', -7, ['a']]);
    append(op, ['b']);
    expect(op).toStrictEqual([5, 'asdfasdf', -7, ['ab']]);
  });  
});

describe('normalize()', () => {
  test('normalizes operation', () => {
    expect(normalize(['asdf'])).toStrictEqual(['asdf']);
    expect(normalize(['asdf', 'e'])).toStrictEqual(['asdfe']);
    expect(normalize(['asdf', 'e', 1, 2])).toStrictEqual(['asdfe']);
    expect(normalize(['asdf', 'e', 1, 2, -3])).toStrictEqual(['asdfe', 3, -3]);
    expect(normalize(['asdf', 'e', 1, 2, -3, -1, -1])).toStrictEqual(['asdfe', 3, -5]);
    expect(normalize(['asdf', 'e', 1, 2, -3, -1, -1, ['asdf']])).toStrictEqual(['asdfe', 3, -5, ['asdf']]);
    expect(normalize(['asdf', 'e', 1, 2, -3, -1, -1, ['asdf'], ['a']])).toStrictEqual(['asdfe', 3, -5, ['asdfa']]);
    expect(normalize(['asdf', 'e', 1, 2, -3, -1, -1, ['asdf'], 3, ['a']])).toStrictEqual(['asdfe', 3, -5, ['asdf'], 3, ['a']]);
  });
});

describe('apply()', () => {
  test('can apply operation', () => {
    expect(apply('', ['abc'])).toBe('abc');
    expect(apply('13', [1, '2'])).toBe('123');
    expect(apply('13', [1, '2', '4'])).toBe('1243');
    expect(apply('13', [1, '2', 1, '4'])).toBe('1234');
    expect(apply('13', [1, '2', 2, '4'])).toBe('1234');
    expect(apply('13', [1, '2', 3, '4'])).toBe('1234');
    expect(apply('123', [1, -1])).toBe('13');
    expect(apply('123', [1, -1, 1, 'a'])).toBe('13a');
    expect(apply('123', [1, -1, 1])).toBe('13');
    expect(apply('123', [1, ['2'], 1, 'a'])).toBe('13a');
  });
});
