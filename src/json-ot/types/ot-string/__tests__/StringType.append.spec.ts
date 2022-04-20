import {StringType} from '../StringType';
import {StringTypeOp} from '../types';

const append = StringType.append;

test('adds components to operation', () => {
  const op: StringTypeOp = [];
  append(op, 1);
  expect(op).toStrictEqual([1]);
  append(op, 0);
  expect(op).toStrictEqual([1]);
  append(op, 4);
  expect(op).toStrictEqual([5]);
  append(op, 'asdf');
  expect(op).toStrictEqual([5, 'asdf']);
  append(op, 'asdf');
  expect(op).toStrictEqual([5, 'asdfasdf']);
  append(op, -4);
  expect(op).toStrictEqual([5, 'asdfasdf', -4]);
  append(op, 0);
  expect(op).toStrictEqual([5, 'asdfasdf', -4]);
  append(op, -3);
  expect(op).toStrictEqual([5, 'asdfasdf', -7]);
  append(op, ['a']);
  expect(op).toStrictEqual([5, 'asdfasdf', -7, ['a']]);
  append(op, ['b']);
  expect(op).toStrictEqual([5, 'asdfasdf', -7, ['ab']]);
});
