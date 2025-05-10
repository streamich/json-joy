import {JsonCrdtDiff} from '../JsonCrdtDiff';
import {Model} from '../../json-crdt/model';
import {RandomJson} from '@jsonjoy.com/util/lib/json-random';

const assertDiff = (src: unknown, dst: unknown) => {
  const model = Model.create();
  model.api.root(src);
  const patch1 = new JsonCrdtDiff(model).diff(model.root, dst);
  // console.log(model + '');
  // console.log(patch1 + '');
  model.applyPatch(patch1);
  // console.log(model + '');
  expect(model.view()).toEqual(dst);
  const patch2 = new JsonCrdtDiff(model).diff(model.root, dst);
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

test('two random arrays of integers', () => {
  const iterations = 100;

  const randomArray = () => {
    const len = Math.floor(Math.random() * 10);
    const arr: unknown[] = [];
    for (let i = 0; i < len; i++) {
      arr.push(Math.ceil(Math.random() * 13));
    }
    return arr;
  };

  for (let i = 0; i < iterations; i++) {
    const src = randomArray();
    const dst = randomArray();
    try {
      assertDiff(src, dst);
    } catch (error) {
      console.error('src', src);
      console.error('dst', dst);
      throw error;
    }
  }
});
