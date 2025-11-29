import {toJsonOp} from '../json-patch';
import {apply} from '../apply';

test('can add object key', () => {
  const op = toJsonOp([{op: 'add', path: '/foo', value: 123}]);
  const result = apply({}, op);
  expect(result).toStrictEqual({foo: 123});
});

test('can delete object key', () => {
  const op = toJsonOp([{op: 'remove', path: '/foo'}]);
  const result = apply({foo: 1, bar: 2}, op);
  expect(result).toStrictEqual({bar: 2});
});

test('can move key', () => {
  const op = toJsonOp([{op: 'move', path: '/foo', from: '/bar'}]);
  const result = apply({x: 1, bar: 2}, op);
  expect(result).toStrictEqual({x: 1, foo: 2});
});

test('can copy key', () => {
  const op = toJsonOp([{op: 'copy', path: '/a/foo', from: '/a/bar'}]);
  const result = apply({x: 1, a: {bar: 2}}, op);
  expect(result).toStrictEqual({x: 1, a: {foo: 2, bar: 2}});
});

test('can replace existing key', () => {
  const op = toJsonOp([{op: 'replace', path: '/a/foo', value: false}]);
  const result = apply({x: 1, a: {foo: 2}}, op);
  expect(result).toStrictEqual({x: 1, a: {foo: false}});
});

test('throws when replacing non-existing key', () => {
  const op = toJsonOp([{op: 'replace', path: '/a/foo', value: 123}]);
  expect(() => apply({x: 1, a: {bar: 2}}, op)).toThrow();
});

test('can execute "test" operation', () => {
  const op1 = toJsonOp([{op: 'test', path: '/a/bar', value: [0]}]);
  const op2 = toJsonOp([{op: 'test', path: '/a/bar', value: [1]}]);
  expect(apply({x: 1, a: {bar: [0]}}, op1)).toStrictEqual({x: 1, a: {bar: [0]}});
  expect(() => apply({x: 1, a: {bar: [0]}}, op2)).toThrow();
});

test('can execute a patch', () => {
  const op = toJsonOp([
    {op: 'test', path: '/a/bar', value: [0]},
    {op: 'add', path: '/a/foo', value: 123},
    {op: 'remove', path: '/a/bar'},
  ]);
  const doc = {x: 1, a: {bar: [0]}};
  expect(apply(doc, op)).toStrictEqual({x: 1, a: {foo: 123}});
});

test('can insert into an array', () => {
  const op = toJsonOp([{op: 'add', path: '/x/1', value: 2}]);
  const doc = {x: [1, 3]};
  expect(apply(doc, op)).toStrictEqual({x: [1, 2, 3]});
});

test('can insert at the end of array', () => {
  const op = toJsonOp([{op: 'add', path: '/x/2', value: null}]);
  const doc = {x: [1, 3]};
  expect(apply(doc, op)).toStrictEqual({x: [1, 3, null]});
});

test('can insert at the beginning of array', () => {
  const op = toJsonOp([{op: 'add', path: '/x/0', value: null}]);
  const doc = {x: [1, 3]};
  expect(apply(doc, op)).toStrictEqual({x: [null, 1, 3]});
});

test('can push to the end of the array', () => {
  const op = toJsonOp([{op: 'add', path: '/x/-', value: null}]);
  const doc = {x: [1, 3]};
  expect(apply(doc, op)).toStrictEqual({x: [1, 3, null]});
});

test('can apply empty patch', () => {
  const op = toJsonOp([]);
  const doc = {x: [1, 3]};
  expect(apply(doc, op)).toStrictEqual({x: [1, 3]});
});

test('can replace document root', () => {
  const doc = {foo: 'bar'};
  const op = toJsonOp([{op: 'replace', path: '', value: {baz: 'qux'}}]);
  expect(apply(doc, op)).toStrictEqual({baz: 'qux'});
});

test('repeated removes in array', () => {
  const doc = [1, 2, 3, 4];
  const op = toJsonOp([
    {op: 'remove', path: '/2'},
    {op: 'remove', path: '/1'},
  ]);
  const result = apply(doc, op);
  expect(result).toStrictEqual([1, 4]);
});
