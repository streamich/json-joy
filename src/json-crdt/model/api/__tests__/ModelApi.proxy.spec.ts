import {Model} from '../../Model';
import {ConApi, ObjApi, StrApi, VecApi, ValApi} from '../nodes';
import {ConNode, RootLww, VecNode, ObjNode, StrNode} from '../../../nodes';
import {vec} from '../../../../json-crdt-patch';

test('proxy API supports object types', () => {
  const model = Model.withLogicalClock() as Model<
    ObjNode<{
      foo: StrNode;
      bar: ConNode<number>;
    }>
  >;
  model.api.root({
    foo: 'asdf',
    bar: 1234,
  });
  const root = model.api.r.proxy();
  const rootApi: ValApi = root.toApi();
  expect(rootApi).toBeInstanceOf(ValApi);
  expect(rootApi.node).toBeInstanceOf(RootLww);
  expect(rootApi.view()).toStrictEqual({
    foo: 'asdf',
    bar: 1234,
  });
  const obj = root.val;
  const objApi: ObjApi = obj.toApi();
  expect(objApi).toBeInstanceOf(ObjApi);
  expect(objApi.node).toBeInstanceOf(ObjNode);
  expect(objApi.view()).toStrictEqual({
    foo: 'asdf',
    bar: 1234,
  });
  const foo = obj.foo;
  const fooApi: StrApi = foo.toApi();
  expect(fooApi).toBeInstanceOf(StrApi);
  expect(fooApi.node).toBeInstanceOf(StrNode);
  expect(fooApi.view()).toStrictEqual('asdf');
  const bar = obj.bar;
  const barApi: ConApi = bar.toApi();
  expect(barApi).toBeInstanceOf(ConApi);
  expect(barApi.node).toBeInstanceOf(ConNode);
  expect(barApi.view()).toStrictEqual(1234);
});

describe('supports all node types', () => {
  type Schema = ObjNode<{
    obj: ObjNode<{
      str: StrNode;
      num: ConNode<number>;
    }>;
    vec: VecNode<[StrNode]>;
  }>;
  const model = Model.withLogicalClock() as Model<Schema>;
  const data = {
    obj: {
      str: 'asdf',
      num: 1234,
    },
    vec: vec('asdf', 1234, true, null),
  };
  model.api.root(data);

  // console.log(model.root + '');

  test('object as root node', () => {
    const proxy = model.api.r.proxy();
    const obj = proxy.val;
    const objApi: ObjApi = obj.toApi();
    expect(objApi).toBeInstanceOf(ObjApi);
    expect(objApi.node).toBeInstanceOf(ObjNode);
    const keys = new Set(Object.keys(objApi.view()));
    expect(keys.has('obj')).toBe(true);
    expect(keys.has('vec')).toBe(true);
  });

  test('nested object', () => {
    const proxy = model.api.r.proxy();
    const obj = proxy.val.obj;
    const objApi: ObjApi = obj.toApi();
    expect(objApi).toBeInstanceOf(ObjApi);
    expect(objApi.node).toBeInstanceOf(ObjNode);
    const keys = new Set(Object.keys(objApi.view()));
    expect(keys.has('str')).toBe(true);
    expect(keys.has('num')).toBe(true);
  });

  test('string as object key', () => {
    const proxy = model.api.r.proxy();
    const str = proxy.val.obj.str;
    const strApi: StrApi = str.toApi();
    expect(strApi).toBeInstanceOf(StrApi);
    expect(strApi.node).toBeInstanceOf(StrNode);
    expect(strApi.view()).toStrictEqual('asdf');
  });

  test('number constant as object key', () => {
    const proxy = model.api.r.proxy();
    const num = proxy.val.obj.num;
    const numApi: ConApi = num.toApi();
    expect(numApi).toBeInstanceOf(ConApi);
    expect(numApi.node).toBeInstanceOf(ConNode);
    expect(numApi.view()).toStrictEqual(1234);
  });

  test('vector', () => {
    const proxy = model.api.r.proxy();
    const vec = proxy.val.vec;
    const vecApi: VecApi = vec.toApi();
    expect(vecApi).toBeInstanceOf(VecApi);
    expect(vecApi.node).toBeInstanceOf(VecNode);
    expect(vecApi.view()).toStrictEqual(['asdf', 1234, true, null]);
  });
});
