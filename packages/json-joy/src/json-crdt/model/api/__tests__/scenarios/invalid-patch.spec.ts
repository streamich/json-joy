import {Model} from '../../../Model';

test('does not allow recursively nested objects', () => {
  const doc = Model.create();
  const obj1 = doc.api.builder.obj();
  const obj2 = doc.api.builder.obj();
  doc.api.builder.insObj(obj1, [['foo', obj2]]);
  doc.api.builder.insObj(obj2, [['bar', obj1]]);
  doc.api.builder.root(obj1);
  doc.api.apply();
  expect(doc.view()).toStrictEqual({foo: {}});
});

test('does not allow recursively nested objects - reverse', () => {
  const doc = Model.create();
  const obj1 = doc.api.builder.obj();
  const obj2 = doc.api.builder.obj();
  doc.api.builder.insObj(obj1, [['foo', obj2]]);
  doc.api.builder.insObj(obj2, [['bar', obj1]]);
  doc.api.builder.root(obj2);
  doc.api.apply();
  expect(doc.view()).toStrictEqual({});
});

test('does not allow recursively nested objects, multiple levels deep', () => {
  const doc = Model.create();
  const obj1 = doc.api.builder.obj();
  const obj2 = doc.api.builder.obj();
  const obj3 = doc.api.builder.obj();
  doc.api.builder.insObj(obj1, [['foo', obj2]]);
  doc.api.builder.insObj(obj2, [['bar', obj3]]);
  doc.api.builder.insObj(obj3, [['baz', obj1]]);
  doc.api.builder.root(obj1);
  doc.api.apply();
  expect(doc.view()).toStrictEqual({foo: {bar: {}}});
});

test('does not allow recursively nested arrays', () => {
  const doc = Model.create();
  const arr1 = doc.api.builder.arr();
  const arr2 = doc.api.builder.arr();
  doc.api.builder.insArr(arr1, arr1, [arr2]);
  doc.api.builder.insArr(arr2, arr2, [arr1]);
  doc.api.builder.root(arr1);
  doc.api.apply();
  expect(doc.view()).toStrictEqual([[]]);
});

test('does not allow recursively nested arrays - reverse', () => {
  const doc = Model.create();
  const arr1 = doc.api.builder.arr();
  const arr2 = doc.api.builder.arr();
  doc.api.builder.insArr(arr1, arr1, [arr2]);
  doc.api.builder.insArr(arr2, arr2, [arr1]);
  doc.api.builder.root(arr2);
  doc.api.apply();
  expect(doc.view()).toStrictEqual([]);
});

test('does not allow recursively nested arrays, multiple levels deep', () => {
  const doc = Model.create();
  const arr1 = doc.api.builder.arr();
  const arr2 = doc.api.builder.arr();
  const arr3 = doc.api.builder.arr();
  const obj = doc.api.builder.obj();
  doc.api.builder.insArr(arr1, arr1, [arr2]);
  doc.api.builder.insArr(arr2, arr2, [arr3]);
  doc.api.builder.insArr(arr3, arr3, [obj]);
  doc.api.builder.insObj(obj, [['foo', arr1]]);
  doc.api.builder.root(arr1);
  doc.api.apply();
  expect(doc.view()).toStrictEqual([[[{}]]]);
});
