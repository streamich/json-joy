import {compose} from '../compose';
import {apply} from '../apply';
import type {BinaryOp} from '../types';

const b = (...octets: number[]) => new Uint8Array(octets);

describe('compose()', () => {
  test('can combine two ops', () => {
    const op1: BinaryOp = [1, b(1)];
    const op2: BinaryOp = [1, b(2)];
    const op3 = compose(op1, op2);
    expect(op3).toStrictEqual([1, b(2, 1)]);
  });

  test('can delete insert of op1', () => {
    const op1: BinaryOp = [1, b(1)];
    const op2: BinaryOp = [1, -1, b(2)];
    const op3 = compose(op1, op2);
    expect(op3).toStrictEqual([1, b(2)]);
  });

  type TestCase = [name: string, str: Uint8Array, op1: BinaryOp, op2: BinaryOp, expected: Uint8Array, only?: boolean];

  const testCases: TestCase[] = [
    ['insert-insert', b(4, 5, 6), [1, b(1)], [1, b(2)], b(4, 2, 1, 5, 6)],
    ['insert-delete', b(4, 5, 6), [1, b(1)], [1, -1], b(4, 5, 6)],
    ['insert-delete-2', b(4, 5, 6), [1, b(1)], [2, -1], b(4, 1, 6)],
    ['insert in previous insert', b(1, 1, 2, 2), [2, b(3, 3, 3, 3)], [4, b(4, 4)], b(1, 1, 3, 3, 4, 4, 3, 3, 2, 2)],
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
