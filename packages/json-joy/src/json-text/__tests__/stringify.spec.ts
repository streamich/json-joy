import {stringify} from '../stringify';

test('prints human readable JSON-like representation', () => {
  const json = [null, true, false, 123, 123.456, 'asdf', [1, 2, 3], {foo: 'bar'}];
  expect(stringify(json)).toBe('[ !n, !t, !f, 123, 123.456, "asdf", [ 1, 2, 3 ], { foo = "bar" } ]');
});
