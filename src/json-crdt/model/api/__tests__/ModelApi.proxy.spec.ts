import {Model} from '../../Model';
import {ConApi, ObjApi, StrApi, VecApi, ValApi, ArrApi, BinApi, NodeApi} from '../nodes';
import {ConNode, RootNode, ObjNode, StrNode, type ValNode} from '../../../nodes';
import {s} from '../../../../json-crdt-patch';
import type {ProxyNodeVal} from '../proxy';

test('proxy API supports object types', () => {
  const model = Model.create() as any as Model<
    ObjNode<{
      foo: StrNode;
      bar: ConNode<number>;
    }>
  >;
  model.api.set({
    foo: 'asdf',
    bar: 1234,
  });
  const root = model.api.s;
  const rootApi = root.$;
  expect(rootApi).toBeInstanceOf(ValApi);
  expect(rootApi.node).toBeInstanceOf(RootNode);
  expect(rootApi.view()).toStrictEqual({
    foo: 'asdf',
    bar: 1234,
  });
  const obj = root.val;
  const objApi: ObjApi = obj.$;
  expect(objApi).toBeInstanceOf(ObjApi);
  expect(objApi.node).toBeInstanceOf(ObjNode);
  expect(objApi.view()).toStrictEqual({
    foo: 'asdf',
    bar: 1234,
  });
  const foo = obj.foo;
  const fooApi: StrApi = foo.$;
  expect(fooApi).toBeInstanceOf(StrApi);
  expect(fooApi.node).toBeInstanceOf(StrNode);
  expect(fooApi.view()).toStrictEqual('asdf');
  const bar = obj.bar;
  const barApi: ConApi = bar.$;
  expect(barApi).toBeInstanceOf(ConApi);
  expect(barApi.node).toBeInstanceOf(ConNode);
  expect(barApi.view()).toStrictEqual(1234);
});

describe('supports all node types', () => {
  const model = Model.create().setSchema(
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
    const proxy = model.api.s;
    const obj = proxy.val;
    const objApi: ObjApi = obj.$;
    expect(objApi).toBeInstanceOf(ObjApi);
    expect(objApi.node).toBeInstanceOf(ObjNode);
    expect(obj.$.view().obj).not.toBe(undefined);
    expect(obj.$.view().vec).not.toBe(undefined);
  });

  test('nested object', () => {
    expect(model.s.obj.$).toBeInstanceOf(ObjApi);
    expect(model.s.obj.$.view().str).not.toBe(undefined);
    expect(model.s.obj.$.view().num).not.toBe(undefined);
  });

  test('str', () => {
    expect(model.s.obj.str.$).toBeInstanceOf(StrApi);
    expect(model.s.obj.str.$.view()).toStrictEqual('asdf');
  });

  test('bin', () => {
    expect(model.s.bin.$).toBeInstanceOf(BinApi);
    expect(model.s.bin.$.view()).toStrictEqual(new Uint8Array([1, 2, 3]));
  });

  test('vec', () => {
    expect(model.s.vec.$).toBeInstanceOf(VecApi);
    expect(model.s.vec.$.view()).toStrictEqual(['asdf', 1234, true, null]);
  });

  test('arr', () => {
    expect(model.s.arr.$).toBeInstanceOf(ArrApi);
    expect(model.s.arr.$.view()).toStrictEqual(['asdf', 0]);
  });

  test('val', () => {
    expect(model.s.arr[1].$).toBeInstanceOf(ValApi);
    expect(model.s.arr[1].$.view()).toStrictEqual(0);
  });

  test('con', () => {
    expect(model.s.arr[0].$).toBeInstanceOf(ConApi);
    expect(model.s.arr[0].$.view()).toStrictEqual('asdf');
  });

  test('con - 2', () => {
    expect((model.s.arr[1] as ProxyNodeVal<ValNode<ConNode<number>>>).val.$).toBeInstanceOf(ConApi);
    expect((model.s.arr[1] as ProxyNodeVal<ValNode<ConNode<number>>>).val.$.view()).toStrictEqual(0);
  });

  test('con - 3', () => {
    expect(model.s.obj.num.$).toBeInstanceOf(ConApi);
    expect(model.s.obj.num.$.view()).toStrictEqual(1234);
  });
});

describe('$ proxy', () => {
  const schema = s.obj({
    obj: s.obj({
      str: s.str('asdf'),
      num: s.con(1234),
      address: s.obj({
        city: s.str<string>('New York'),
        zip: s.con(10001),
      }),
    }),
    vec: s.vec(s.con('asdf'), s.con(1234), s.con(true), s.con(null)),
    arr: s.arr([s.con('asdf'), s.val(s.con(0))]),
    bin: s.bin(new Uint8Array([1, 2, 3])),
  });

  test('returns NodeApi? for un-typed model', () => {
    const model1 = Model.create();
    const model2 = Model.create<any>() as Model<any>;
    model1.api.set(schema);
    model2.api.set(schema);
    const node1 = model1.api.$.obj.str.$;
    const node2 = model2.api.$.obj.str.$;
    const assertNodeApi = (node?: NodeApi) => {
      expect(node instanceof NodeApi).toBe(true);
    };
    assertNodeApi(node1);
    assertNodeApi(node2);
    expect(node1?.asStr().view()).toBe('asdf');
    expect(node2?.asStr().view()).toBe('asdf');
  });

  test('returns StrApi? for typed model', () => {
    const model = Model.create(schema);
    const node = model.api.$.obj.str.$;
    const assertStrApi = (node?: StrApi) => {
      expect(node instanceof StrApi).toBe(true);
    };
    assertStrApi(node);
    expect(node?.view()).toBe('asdf');
  });

  test('can access various node types', () => {
    const model = Model.create(schema);
    expect(model.api.$.obj.str.$?.view()).toBe('asdf');
    expect(model.api.$.obj.num.$?.view()).toBe(1234);
    expect(model.api.$.obj.address.city.$?.view()).toBe('New York');
    expect(model.api.$.obj.address.zip.$?.view()).toBe(10001);
    expect(model.api.$.vec[0].$?.view()).toBe('asdf');
    expect(model.api.$.vec[1].$?.view()).toBe(1234);
    expect(model.api.$.vec[2].$?.view()).toBe(true);
    expect(model.api.$.vec[3].$?.view()).toBe(null);
    expect(model.api.$.arr[0].$?.view()).toBe('asdf');
    expect(model.api.$.arr[1].$?.view()).toBe(0);
    expect(model.api.$.bin.$?.view()).toEqual(new Uint8Array([1, 2, 3]));
    expect(model.api.$.obj.address.$!.view()).toEqual({
      city: 'New York',
      zip: 10001,
    });
    expect(model.api.$.obj.address.$ instanceof ObjApi).toBe(true);
  });

  test('returns undefined if node not found', () => {
    const model = Model.create(schema);
    expect(model.api.$.vec[10].$?.view()).toBe(undefined);
    expect(model.api.$.arr[111].$?.view()).toBe(undefined);
    expect((model.api.$.arr as any).asdf.$?.view()).toBe(undefined);
  });

  test('returns undefined if node not found in un-typed model', () => {
    const model = Model.create();
    model.api.set(schema);
    expect(model.api.$.asdfasdfasdf.$?.view()).toBe(undefined);
    expect(model.api.$[0].$?.view()).toBe(undefined);
    expect(model.api.$.vec[10].$?.view()).toBe(undefined);
    expect(model.api.$.arr[111].$?.view()).toBe(undefined);
    expect(model.api.$.arr.asdf.$?.view()).toBe(undefined);
  });
});
