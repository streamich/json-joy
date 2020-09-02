import {escapeComponent} from '../util';

test('string without escaped characters as is', () => {
  const res = escapeComponent('foobar');
  expect(res).toBe('foobar');
});

test('replaces special characters', () => {
  expect(escapeComponent('foo~/')).toBe('foo~0~1');
});
