import {Model} from '../Model';
import type {ConNode, ObjNode, StringRga} from '../../nodes';

test('can add TypeScript types to Model view', () => {
  const model = Model.withLogicalClock() as Model<
    ObjNode<{
      foo: StringRga;
      bar: ConNode<number>;
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
