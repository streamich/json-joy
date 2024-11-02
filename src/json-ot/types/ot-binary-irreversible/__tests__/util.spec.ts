import {normalize, append} from '../util';
import type {BinaryOp} from '../types';

const b = (...octets: number[]) => new Uint8Array(octets);

describe('append()', () => {
  test('adds components to operation', () => {
    const op: BinaryOp = [];
    append(op, 1);
    expect(op).toStrictEqual([1]);
    append(op, 0);
    expect(op).toStrictEqual([1]);
    append(op, 4);
    expect(op).toStrictEqual([5]);
    append(op, b(1, 2, 3, 4));
    expect(op).toStrictEqual([5, b(1, 2, 3, 4)]);
    append(op, b(1, 2, 3, 4));
    expect(op).toStrictEqual([5, b(1, 2, 3, 4, 1, 2, 3, 4)]);
    append(op, -4);
    expect(op).toStrictEqual([5, b(1, 2, 3, 4, 1, 2, 3, 4), -4]);
    append(op, 0);
    expect(op).toStrictEqual([5, b(1, 2, 3, 4, 1, 2, 3, 4), -4]);
    append(op, -3);
    expect(op).toStrictEqual([5, b(1, 2, 3, 4, 1, 2, 3, 4), -7]);
  });
});

describe('normalize()', () => {
  test('normalizes operation', () => {
    expect(normalize([b(1, 2, 3, 4)])).toStrictEqual([b(1, 2, 3, 4)]);
    expect(normalize([b(1, 2, 3, 4), b(5)])).toStrictEqual([b(1, 2, 3, 4, 5)]);
    expect(normalize([b(1, 2, 3, 4), b(5), 1, 2])).toStrictEqual([b(1, 2, 3, 4, 5)]);
    expect(normalize([b(1, 2, 3, 4), b(5), 1, 2, -3])).toStrictEqual([b(1, 2, 3, 4, 5), 3, -3]);
  });
});
