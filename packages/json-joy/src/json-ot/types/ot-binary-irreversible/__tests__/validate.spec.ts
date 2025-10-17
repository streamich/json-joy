import {validate} from '../validate';

const b = (...octets: number[]) => new Uint8Array(octets);

describe('validate()', () => {
  test('returns 0 on valid op', () => {
    expect(validate([b(123)])).toBe(0);
    expect(validate([1, b(123)])).toBe(0);
    expect(validate([1, -1, b(123)])).toBe(0);
  });

  test('returns non-zero integer on invalid operation', () => {
    expect(validate([1])).not.toBe(0);
    expect(validate([0])).not.toBe(0);
    expect(validate([5])).not.toBe(0);
    expect(validate([1, b(123), 11])).not.toBe(0);
    expect(validate([1, -1, b(1), b(2)])).not.toBe(0);
    expect(validate([1, -1, b(1), b()])).not.toBe(0);
    expect(validate([b()])).not.toBe(0);
    expect(validate([1, 0.3])).not.toBe(0);
    expect(validate([1, b()])).not.toBe(0);
    expect(validate([b()])).not.toBe(0);
  });
});
