import {applyPatch} from '../applyPatch';

test('cannot add key to empty document', () => {
  expect(() => applyPatch(undefined, [{op: 'add', path: '/foo', value: 123}], {mutate: true})).toThrow();
});

test('can overwrite empty document', () => {
  const doc = applyPatch(undefined, [{op: 'add', path: '', value: {foo: 123}}], {mutate: true}).doc;
  expect(doc).toEqual({foo: 123});
});

test('cannot add value to nonexisting path', () => {
  expect(() => applyPatch({foo: 123}, [{op: 'add', path: '/foo/bar/baz', value: 'test'}], {mutate: true})).toThrow();
});
