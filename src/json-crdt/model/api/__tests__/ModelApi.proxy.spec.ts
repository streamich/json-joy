import {Model} from '../../Model';
import {ConstApi, ObjectApi, StringApi, TupleApi, ValueApi} from '../nodes';
import {RootLww} from '../../../types/lww-root/RootLww';
import {ObjectLww} from '../../../types/lww-object/ObjectLww';
import {StringRga} from '../../../types/rga-string/StringRga';
import {Const} from '../../../types/const/Const';
import {ArrayLww} from '../../../types/lww-array/ArrayLww';
import {tup} from '../../../../json-crdt-patch';

test('proxy API supports object types', () => {
  const model = Model.withLogicalClock() as Model<ObjectLww<{
    foo: StringRga;
    bar: Const<number>;
  }>>;
  model.api.root({
    foo: 'asdf',
    bar: 1234,
  });
  const root = model.api.r.proxy();
  const rootApi: ValueApi = root.toApi();
  expect(rootApi).toBeInstanceOf(ValueApi);
  expect(rootApi.node).toBeInstanceOf(RootLww);
  expect(rootApi.view()).toStrictEqual({
    foo: 'asdf',
    bar: 1234,
  });
  const obj = root.val;
  const objApi: ObjectApi = obj.toApi();
  expect(objApi).toBeInstanceOf(ObjectApi);
  expect(objApi.node).toBeInstanceOf(ObjectLww);
  expect(objApi.view()).toStrictEqual({
    foo: 'asdf',
    bar: 1234,
  });
  const foo = obj.foo;
  const fooApi: StringApi = foo.toApi();
  expect(fooApi).toBeInstanceOf(StringApi);
  expect(fooApi.node).toBeInstanceOf(StringRga);
  expect(fooApi.view()).toStrictEqual('asdf');
  const bar = obj.bar;
  const barApi: ConstApi = bar.toApi();
  expect(barApi).toBeInstanceOf(ConstApi);
  expect(barApi.node).toBeInstanceOf(Const);
  expect(barApi.view()).toStrictEqual(1234);
});

describe('supports all node types', () => {
  type Schema = ObjectLww<{
    obj: ObjectLww<{
      str: StringRga;
      num: Const<number>;
    }>;
    vec: ArrayLww<[
      StringRga,
    ]>;
  }>;
  const model = Model.withLogicalClock() as Model<Schema>;
  const data = {
    obj: {
      str: 'asdf',
      num: 1234,
    },
    vec: tup(
      'asdf',
      1234,
      true,
      null,
    ),
  };
  model.api.root(data);

  // console.log(model.root + '');

  test('object as root node', () => {
    const proxy = model.api.r.proxy();
    const obj = proxy.val;
    const objApi: ObjectApi = obj.toApi();
    expect(objApi).toBeInstanceOf(ObjectApi);
    expect(objApi.node).toBeInstanceOf(ObjectLww);
    const keys = new Set(Object.keys(objApi.view()));
    expect(keys.has('obj')).toBe(true);
    expect(keys.has('vec')).toBe(true);
  });

  test('nested object', () => {
    const proxy = model.api.r.proxy();
    const obj = proxy.val.obj;
    const objApi: ObjectApi = obj.toApi();
    expect(objApi).toBeInstanceOf(ObjectApi);
    expect(objApi.node).toBeInstanceOf(ObjectLww);
    const keys = new Set(Object.keys(objApi.view()));
    expect(keys.has('str')).toBe(true);
    expect(keys.has('num')).toBe(true);
  });

  test('string as object key', () => {
    const proxy = model.api.r.proxy();
    const str = proxy.val.obj.str;
    const strApi: StringApi = str.toApi();
    expect(strApi).toBeInstanceOf(StringApi);
    expect(strApi.node).toBeInstanceOf(StringRga);
    expect(strApi.view()).toStrictEqual('asdf');
  });

  test('number constant as object key', () => {
    const proxy = model.api.r.proxy();
    const num = proxy.val.obj.num;
    const numApi: ConstApi = num.toApi();
    expect(numApi).toBeInstanceOf(ConstApi);
    expect(numApi.node).toBeInstanceOf(Const);
    expect(numApi.view()).toStrictEqual(1234);
  });

  test('vector', () => {
    const proxy = model.api.r.proxy();
    const vec = proxy.val.vec;
    const vecApi: TupleApi = vec.toApi();
    expect(vecApi).toBeInstanceOf(TupleApi);
    expect(vecApi.node).toBeInstanceOf(ArrayLww);
    expect(vecApi.view()).toStrictEqual([
      'asdf',
      1234,
      true,
      null,
    ]);
  });
});