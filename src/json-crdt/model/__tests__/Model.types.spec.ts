import {Model} from '../Model';
import type {ObjectLww} from '../../types/lww-object/ObjectLww';
import type {StringRga} from '../../types/rga-string/StringRga';
import type {Const} from '../../types/con/Const';

test('can add TypeScript types to Model view', () => {
  const model = Model.withLogicalClock() as Model<
    ObjectLww<{
      foo: StringRga;
      bar: Const<number>;
    }>
  >;
  model.api.root({
    foo: 'asdf',
    bar: 1234,
  });
  const str: string = model.view().foo;
  const num: number = model.view().bar;
  expect(str).toBe('asdf');
  expect(num).toBe(1234);
});
