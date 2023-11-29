import {Model} from '../../Model';
import {ConApi, ObjApi, StrApi, VecApi, ValApi, ArrApi, BinApi} from '../nodes';
import {ConNode, RootNode, ObjNode, StrNode, ValNode} from '../../../nodes';
import {s} from '../../../../json-crdt-patch';
import {ProxyNodeVal} from '../proxy';

test('proxy API supports object types', () => {
  const model = Model.withLogicalClock() as any as Model<
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
  const rootApi = root.toApi();
  expect(rootApi).toBeInstanceOf(ValApi);
  expect(rootApi.node).toBeInstanceOf(RootNode);
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
  const model = Model.withLogicalClock().setSchema(
    s.obj({
      obj: s.obj({
        str: s.str('asdf'),
        num: s.con(1234),
      }),
      vec: s.vec(s.con('asdf'), s.con(1234), s.con(true), s.con(null)),
      arr: s.arr([s.con('asdf'), s.val(s.con(0))]),
      bin: s.bin(new Uint8Array([1, 2, 3])),
    }),
  );

  // console.log(model.root + '');

  test('object as root node', () => {
    const proxy = model.api.r.proxy();
    const obj = proxy.val;
    const objApi: ObjApi = obj.toApi();
    expect(objApi).toBeInstanceOf(ObjApi);
    expect(objApi.node).toBeInstanceOf(ObjNode);
    expect(obj.toView().obj).not.toBe(undefined);
    expect(obj.toView().vec).not.toBe(undefined);
  });

  test('nested object', () => {
    expect(model.s.obj.toApi()).toBeInstanceOf(ObjApi);
    expect(model.s.obj.toView().str).not.toBe(undefined);
    expect(model.s.obj.toView().num).not.toBe(undefined);
  });

  test('str', () => {
    expect(model.s.obj.str.toApi()).toBeInstanceOf(StrApi);
    expect(model.s.obj.str.toView()).toStrictEqual('asdf');
  });

  test('bin', () => {
    expect(model.s.bin.toApi()).toBeInstanceOf(BinApi);
    expect(model.s.bin.toView()).toStrictEqual(new Uint8Array([1, 2, 3]));
  });

  test('vec', () => {
    expect(model.s.vec.toApi()).toBeInstanceOf(VecApi);
    expect(model.s.vec.toView()).toStrictEqual(['asdf', 1234, true, null]);
  });

  test('arr', () => {
    expect(model.s.arr.toApi()).toBeInstanceOf(ArrApi);
    expect(model.s.arr.toView()).toStrictEqual(['asdf', 0]);
  });

  test('val', () => {
    expect(model.s.arr[1].toApi()).toBeInstanceOf(ValApi);
    expect(model.s.arr[1].toView()).toStrictEqual(0);
  });

  test('con', () => {
    expect(model.s.arr[0].toApi()).toBeInstanceOf(ConApi);
    expect(model.s.arr[0].toView()).toStrictEqual('asdf');
  });

  test('con - 2', () => {
    expect((model.s.arr[1] as ProxyNodeVal<ValNode<ConNode<number>>>).val.toApi()).toBeInstanceOf(ConApi);
    expect((model.s.arr[1] as ProxyNodeVal<ValNode<ConNode<number>>>).val.toView()).toStrictEqual(0);
  });

  test('con - 3', () => {
    expect(model.s.obj.num.toApi()).toBeInstanceOf(ConApi);
    expect(model.s.obj.num.toView()).toStrictEqual(1234);
  });
});
