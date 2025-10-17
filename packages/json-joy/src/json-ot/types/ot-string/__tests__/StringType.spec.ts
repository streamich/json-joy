import {validate, normalize, apply, compose, transform} from '..';
import {append} from '../util';
import type {StringOp} from '../types';

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
    expect(validate([1, 0.3, ['b'], 'a'])).not.toBe(0);
    expect(validate([1, 0.3])).not.toBe(0);
    expect(validate([1, ''])).not.toBe(0);
    expect(validate([''])).not.toBe(0);
  });
});

describe('append()', () => {
  test('adds components to operation', () => {
    const op: StringOp = [];
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
    expect(normalize(['asdf', 'e', 1, 2, -3, -1, -1, ['asdf'], 3, ['a']])).toStrictEqual([
      'asdfe',
      3,
      -5,
      ['asdf'],
      3,
      ['a'],
    ]);
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

describe('compose()', () => {
  test('can combine two ops', () => {
    const op1: StringOp = [1, 'a'];
    const op2: StringOp = [1, 'b'];
    const op3 = compose(op1, op2);
    expect(op3).toStrictEqual([1, 'ba']);
  });

  test('can delete insert of op1', () => {
    const op1: StringOp = [1, 'a'];
    const op2: StringOp = [1, -1, 'b'];
    const op3 = compose(op1, op2);
    expect(op3).toStrictEqual([1, 'b']);
  });

  type TestCase = [name: string, str: string, op1: StringOp, op2: StringOp, expected: string, only?: boolean];

  const testCases: TestCase[] = [
    ['insert-insert', 'abc', [1, 'a'], [1, 'b'], 'ababc'],
    ['insert-delete', 'abc', [1, 'a'], [1, -1], 'abc'],
    ['insert-delete-2', 'abc', [1, 'a'], [2, -1], 'aac'],
    ['insert in previous insert', 'aabb', [2, '1111'], [4, '22'], 'aa112211bb'],
    ['fuzzer bug #1', 'd6', ['}B'], [['}'], ';0q', 2, ['6']], ';0qBd'],
    ['fuzzer bug #2', 'Ai', [['A'], '#', -1], [-1], ''],
    ['fuzzer bug #3', 'M}', ['!y1'], ["'/*s", 2, ',/@', -2, ['}']], "'/*s!y,/@"],
    ['fuzzer bug #4', '8sL', [-2, 'w', ['L']], [['w']], ''],
    ['fuzzer bug #5', '%V=', [2, ';'], ['3O"', 1, 'J', -2], '3O"%J='],
  ];

  describe('can compose', () => {
    for (const [name, str, op1, op2, expected, only] of testCases) {
      (only ? test.only : test)(`${name}`, () => {
        const res1 = apply(apply(str, op1), op2);
        // console.log('res1', res1);
        const op3 = compose(op1, op2);
        // console.log('op3', op3);
        const res2 = apply(str, op3);
        // console.log('res2', res2);
        expect(res2).toStrictEqual(res1);
        expect(res2).toStrictEqual(expected);
      });
    }
  });
});

describe('transform()', () => {
  test('can transform two inserts', () => {
    const op1: StringOp = [1, 'a'];
    const op2: StringOp = [3, 'b'];
    const op3 = transform(op1, op2, true);
    const op4 = transform(op2, op1, false);
    expect(op3).toStrictEqual([1, 'a']);
    expect(op4).toStrictEqual([4, 'b']);
  });

  test('insert at the same place', () => {
    const op1: StringOp = [3, 'a'];
    const op2: StringOp = [3, 'b'];
    const op3 = transform(op1, op2, true);
    const op4 = transform(op2, op1, false);
    expect(op3).toStrictEqual([3, 'a']);
    expect(op4).toStrictEqual([4, 'b']);
  });

  test('can transform two deletes', () => {
    const op1: StringOp = [1, -1];
    const op2: StringOp = [3, -1];
    const op3 = transform(op1, op2, true);
    const op4 = transform(op2, op1, false);
    expect(op3).toStrictEqual([1, -1]);
    expect(op4).toStrictEqual([2, -1]);
  });

  type TestCase = [name: string, str: string, op1: StringOp, op2: StringOp, expected: string, only?: boolean];

  const testCases: TestCase[] = [
    ['delete-delete', 'abc', [1, -1], [2, -1], 'a'],
    ['insert-insert', '12345', [1, 'one', 2, 'three'], [2, 'two', 2, 'four'], '1one2two3three4four5'],
  ];

  describe('can transform', () => {
    for (const [name, str, op1, op2, expected, only] of testCases) {
      (only ? test.only : test)(`${name}`, () => {
        const op11 = transform(op1, op2, true);
        const op22 = transform(op2, op1, false);
        const res1 = apply(apply(str, op1), op22);
        const res2 = apply(apply(str, op2), op11);
        // console.log('op11', op11);
        // console.log('op22', op22);
        // console.log('res1', res1);
        // console.log('res2', res2);
        expect(res2).toStrictEqual(res1);
        expect(res2).toStrictEqual(expected);
      });
    }
  });
});
