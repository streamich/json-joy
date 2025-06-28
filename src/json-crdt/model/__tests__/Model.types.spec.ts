import {Model} from '../Model';
import type {ConNode, ObjNode, StrNode} from '../../nodes';

test('can add TypeScript types to Model view', () => {
  const model = Model.withLogicalClock() as any as Model<
    ObjNode<{
      foo: StrNode;
      bar: ConNode<number>;
    }>
  >;
  model.api.set({
    foo: 'asdf',
    bar: 1234,
  });
  const str: string = model.view().foo;
  const num: number = model.view().bar;
  expect(str).toBe('asdf');
  expect(num).toBe(1234);
});
