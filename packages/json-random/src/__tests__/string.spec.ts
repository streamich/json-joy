import {randomString, type Token} from '../string';
import {deterministic} from '../util';

describe('randomString', () => {
  it('should pick a random string from the array', () => {
    const token: Token = ['pick', 'apple', 'banana', 'cherry'];
    const result = randomString(token);
    expect(['apple', 'banana', 'cherry']).toContain(result);
  });

  it('should repeat a pattern a random number of times', () => {
    const token: Token = ['repeat', 2, 5, ['pick', 'x', 'y', 'z', ' ']];
    const result = randomString(token);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('should pick a random character from the Unicode range', () => {
    const token: Token = ['char', 65, 90]; // A-Z
    const result = randomString(token);
    expect(result).toMatch(/^[A-Z]$/);
  });

  it('should pick a random character from the Unicode range three times', () => {
    const token: Token = ['char', 65, 90, 3]; // A-Z
    const result = randomString(token);
    expect(result).toMatch(/^[A-Z]{3}$/);
  });

  it('executes a list of tokens', () => {
    const token: Token = [
      'list',
      ['pick', 'monkey', 'dog', 'cat'],
      ['pick', ' '],
      ['pick', 'ate', 'threw', 'picked'],
      ['pick', ' '],
      ['pick', 'apple', 'banana', 'cherry'],
    ];
    const result = randomString(token);
    expect(/monkey|dog|cat/.test(result)).toBe(true);
    expect(/ate|threw|picked/.test(result)).toBe(true);
    expect(/apple|banana|cherry/.test(result)).toBe(true);
  });

  it('can nest picks', () => {
    const token: Token = ['pick', ['pick', 'monkey', 'dog', 'cat'], ['pick', 'banana', 'apple']];
    const str = deterministic(123, () => randomString(token));
    expect(str).toBe('dog');
  });
});
