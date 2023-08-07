import {apply} from '../apply';

const b = (...octets: number[]) => new Uint8Array(octets);

describe('apply()', () => {
  test('can apply operation', () => {
    expect(apply(b(), [b(1, 2, 3)])).toStrictEqual(b(1, 2, 3));
    expect(apply(b(1, 3), [1, b(2)])).toStrictEqual(b(1, 2, 3));
    expect(apply(b(1, 3), [1, b(2), b(4)])).toStrictEqual(b(1, 2, 4, 3));
    expect(apply(b(1, 3), [1, b(2), 1, b(4)])).toStrictEqual(b(1, 2, 3, 4));
    expect(apply(b(1, 3), [1, b(2), 2, b(4)])).toStrictEqual(b(1, 2, 3, 4));
    expect(apply(b(1, 3), [1, b(2), 3, b(4)])).toStrictEqual(b(1, 2, 3, 4));
    expect(apply(b(1, 2, 3), [1, -1])).toStrictEqual(b(1, 3));
    expect(apply(b(1, 2, 3), [1, -1, 1, b(44)])).toStrictEqual(b(1, 3, 44));
    expect(apply(b(1, 2, 3), [1, -1, 1])).toStrictEqual(b(1, 3));
  });
});
