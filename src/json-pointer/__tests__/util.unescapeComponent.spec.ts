import {unescapeComponent} from '../util';

test('string without escaped characters as is', () => {
  const res = unescapeComponent('foobar');
  expect(res).toBe('foobar');
});

test('replaces special characters', () => {
  expect(unescapeComponent('foo~0~1')).toBe('foo~/');
  expect(unescapeComponent('fo~1o')).toBe('fo/o');
  expect(unescapeComponent('fo~0o')).toBe('fo~o');
});
