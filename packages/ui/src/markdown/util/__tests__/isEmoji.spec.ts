import {isEmoji} from '../isEmoji';

test('returns true for an emoji', () => {
  const result = isEmoji('👍');
  expect(result).toBe(true);
});

test('returns true for multiple emojis', () => {
  const result = isEmoji('👍👍👍👍');
  expect(result).toBe(true);
});

test('returns false for an not an emoji', () => {
  const result = isEmoji('A');
  expect(result).toBe(false);
});

test('returns false for an not an emoji', () => {
  const result = isEmoji('');
  expect(result).toBe(false);
});
