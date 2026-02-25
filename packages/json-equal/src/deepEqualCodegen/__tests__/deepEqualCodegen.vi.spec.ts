import {deepEqualCodegen} from '..';

test('generates a deep equal comparator', () => {
  const js = deepEqualCodegen([1, true, false, 'sdf', {foo: 123, null: null}, [null, true, 'asdf'], 3, {}]);
  const deepEqual = eval(js); // tslint:disable-line

  const res1 = deepEqual([1, true, false, 'sdf', {foo: 123, null: null}, [null, true, 'asdf'], 3, {}]);
  const res2 = deepEqual([2, true, false, 'sdf', {foo: 123, null: null}, [null, true, 'asdf'], 3, {}]);
  const res3 = deepEqual([1, true, false, 'sdf', {foox: 123, null: null}, [null, true, 'asdf'], 3, {}]);
  const res4 = deepEqual([1, true, false, 'sdf', {foo: 123, null: null}, [null, true, 'asdf'], 3, {a: 1}]);

  expect(res1).toBe(true);
  expect(res2).toBe(false);
  expect(res3).toBe(false);
  expect(res4).toBe(false);
});

test('generates a deep equal comparator for primitives', () => {
  /* tslint:disable */
  const equal1 = eval(deepEqualCodegen('asdf'));
  const equal2 = eval(deepEqualCodegen(123));
  const equal3 = eval(deepEqualCodegen(true));
  const equal4 = eval(deepEqualCodegen(null));
  const equal5 = eval(deepEqualCodegen(false));
  const equal6 = eval(deepEqualCodegen(4.4));
  /* tslint:enable */

  expect(equal1('asdf')).toBe(true);
  expect(equal1('asdf2')).toBe(false);

  expect(equal2(123)).toBe(true);
  expect(equal2(1234)).toBe(false);

  expect(equal3(true)).toBe(true);
  expect(equal3(false)).toBe(false);
  expect(equal3(null)).toBe(false);

  expect(equal4(true)).toBe(false);
  expect(equal4(false)).toBe(false);
  expect(equal4(null)).toBe(true);

  expect(equal5(true)).toBe(false);
  expect(equal5(false)).toBe(true);
  expect(equal5(null)).toBe(false);

  expect(equal6(4.4)).toBe(true);
  expect(equal6(4)).toBe(false);
});

test('undefined is not an empty object', () => {
  const js = deepEqualCodegen(undefined);
  const deepEqual = eval(js); // tslint:disable-line
  const res = deepEqual({});
  expect(res).toBe(false);
});
