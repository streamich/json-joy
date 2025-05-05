import {Diff} from '../Diff';
import {Model} from '../../json-crdt/model';
import {RandomJson} from '@jsonjoy.com/util/lib/json-random';

const assertDiff = (src: unknown, dst: unknown) => {
  const model = Model.create();
  model.api.root(src);
  const patch1 = new Diff(model).diff(model.root, dst);
  // console.log(model + '');
  // console.log(patch1 + '');
  model.applyPatch(patch1);
  // console.log(model + '');
  expect(model.view()).toEqual(dst);
  const patch2 = new Diff(model).diff(model.root, dst);
  expect(patch2.ops.length).toBe(0);
};

const iterations = 1000;

test('from random JSON to random JSON', () => {
  for (let i = 0; i < iterations; i++) {
    const src = RandomJson.generate();
    const dst = RandomJson.generate();
    // console.log(src);
    // console.log(dst);
    assertDiff(src, dst);
  }
});
