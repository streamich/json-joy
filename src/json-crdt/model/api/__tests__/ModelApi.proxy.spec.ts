import {Model} from '../../Model';
import {ConstApi, ObjectApi, StringApi, ValueApi} from '../nodes';
import {RootLww} from '../../../types/lww-root/RootLww';
import {ObjectLww} from '../../../types/lww-object/ObjectLww';
import {StringRga} from '../../../types/rga-string/StringRga';
import {Const} from '../../../types/const/Const';

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
