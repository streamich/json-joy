import {$$find} from '../find';

test('can generate two levels deep selector', () => {
  // tslint:disable-next-line
  const selector = eval($$find(['foo', 'bar']));

  expect(selector({foo: {bar: 123}})).toBe(123);
  expect(selector({foo: {bar: {a: 'b'}}})).toEqual({a: 'b'});

  expect(selector({foo: {baz: 'z'}})).toBe(undefined);
  expect(selector({})).toBe(undefined);
  expect(selector(123)).toBe(undefined);
  expect(selector('asdf')).toBe(undefined);
  expect(selector(() => {})).toBe(undefined);
});

test('can generate root selector', () => {
  // tslint:disable-next-line
  const selector = eval($$find([]));

  expect(selector({foo: {bar: {a: 'b'}}})).toEqual({foo: {bar: {a: 'b'}}});
  expect(selector(123)).toEqual(123);
  expect(selector('asdf')).toEqual('asdf');
});

test('can select from an array', () => {
  // tslint:disable-next-line
  const selector = eval($$find(['a', 0, 'b', 1]));

  expect(selector({a: [{b: [1, 2, 3]}]})).toEqual(2);
  expect(selector({a: [{b: {1: 'asdf'}}]})).toEqual('asdf');

  expect(selector({a: [{b: [1]}]})).toEqual(undefined);
  expect(selector(123)).toEqual(undefined);
});

test('can select from an root array or object', () => {
  // tslint:disable-next-line
  const selector = eval($$find(['0']));

  expect(selector([5])).toEqual(5);
  expect(selector([5, 55])).toEqual(5);
  expect(selector({0: 5})).toEqual(5);

  expect(selector({1: 5})).toEqual(undefined);
});
