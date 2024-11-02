import {transform} from '../transform';
import {apply} from '../apply';
import type {BinaryOp} from '../types';

const b = (...octets: number[]) => new Uint8Array(octets);

describe('transform()', () => {
  test('can transform two inserts', () => {
    const op1: BinaryOp = [1, b(1)];
    const op2: BinaryOp = [3, b(2)];
    const op3 = transform(op1, op2, true);
    const op4 = transform(op2, op1, false);
    expect(op3).toStrictEqual([1, b(1)]);
    expect(op4).toStrictEqual([4, b(2)]);
  });

  test('insert at the same place', () => {
    const op1: BinaryOp = [3, b(1)];
    const op2: BinaryOp = [3, b(2)];
    const op3 = transform(op1, op2, true);
    const op4 = transform(op2, op1, false);
    expect(op3).toStrictEqual([3, b(1)]);
    expect(op4).toStrictEqual([4, b(2)]);
  });

  test('can transform two deletes', () => {
    const op1: BinaryOp = [1, -1];
    const op2: BinaryOp = [3, -1];
    const op3 = transform(op1, op2, true);
    const op4 = transform(op2, op1, false);
    expect(op3).toStrictEqual([1, -1]);
    expect(op4).toStrictEqual([2, -1]);
  });

  type TestCase = [name: string, str: Uint8Array, op1: BinaryOp, op2: BinaryOp, expected: Uint8Array, only?: boolean];

  const testCases: TestCase[] = [
    ['delete-delete', b(1, 2, 3), [1, -1], [2, -1], b(1)],
    [
      'insert-insert',
      b(1, 2, 3, 4, 5),
      [1, b(111, 112, 113), 2, b(121, 122, 123, 124, 125)],
      [2, b(131, 132, 133), 2, b(141, 142, 143, 144)],
      b(1, 111, 112, 113, 2, 131, 132, 133, 3, 121, 122, 123, 124, 125, 4, 141, 142, 143, 144, 5),
    ],
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
