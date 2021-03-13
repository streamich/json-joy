import {clockToString} from '../util';

describe('clockToString', () => {
  test('returns correct string values', () => {
    expect(clockToString(0)).toBe('0');
    expect(clockToString(1)).toBe('1');
    expect(clockToString(2)).toBe('2');
    expect(clockToString(70)).toBe('w');
    expect(clockToString(75)).toBe('|');
    expect(clockToString(76)).toBe('}');
    expect(clockToString(77)).toBe('~');
    expect(clockToString(78)).toBe('10');
    expect(clockToString(79)).toBe('11');
    expect(clockToString(80)).toBe('12');
    expect(clockToString(78 * 2)).toBe('20');
    expect(clockToString(78 * 78)).toBe('100');
  });
});
