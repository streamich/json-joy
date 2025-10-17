import {isLetter, isPunctuation, isWhitespace} from '../util';

describe('isLetter()', () => {
  it('should return true for letters', () => {
    expect(isLetter('a')).toBe(true);
    expect(isLetter('z')).toBe(true);
    expect(isLetter('æ')).toBe(true);
    expect(isLetter('б')).toBe(true);
    expect(isLetter('A')).toBe(true);
  });

  it('should return true for numbers', () => {
    expect(isLetter('0')).toBe(true);
    expect(isLetter('1')).toBe(true);
    expect(isLetter('9')).toBe(true);
  });

  it('should return false for non-letters', () => {
    expect(isLetter('!')).toBe(false);
    expect(isLetter(' ')).toBe(false);
    expect(isLetter(' ')).toBe(false);
  });
});

describe('isPunctuation()', () => {
  it('should return true for punctuation', () => {
    expect(isPunctuation('.')).toBe(true);
    expect(isPunctuation(',')).toBe(true);
    expect(isPunctuation('?')).toBe(true);
    expect(isPunctuation('!')).toBe(true);
    expect(isPunctuation('…')).toBe(true);
  });

  it('should return false for non-punctuation', () => {
    expect(isPunctuation('a')).toBe(false);
    expect(isPunctuation('1')).toBe(false);
    expect(isPunctuation(' ')).toBe(false);
  });
});

describe('isWhitespace()', () => {
  it('should return true for whitespace', () => {
    expect(isWhitespace(' ')).toBe(true);
    expect(isWhitespace('\t')).toBe(true);
    expect(isWhitespace('\n')).toBe(true);
    expect(isWhitespace('\r')).toBe(true);
  });

  it('should return false for non-whitespace', () => {
    expect(isWhitespace('a')).toBe(false);
    expect(isWhitespace('1')).toBe(false);
    expect(isWhitespace('.')).toBe(false);
  });
});
