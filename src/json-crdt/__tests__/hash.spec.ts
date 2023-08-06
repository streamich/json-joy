import {RandomJson} from '../../json-random';
import {hashNode} from '../hash';
import {Model} from '../model';

test('can compute Const hash', () => {
  const model = Model.withLogicalClock();
  model.api.root(123);
  const c1 = model.api.val([]).in();
  const hash1 = hashNode(c1.node);
  model.api.root(456);
  const c2 = model.api.val([]).in();
  const hash2 = hashNode(c2.node);
  expect(hash1).not.toBe(hash2);
});

test('random generated model JSON values differ, but the same for the same model', () => {
  const iterations = 100;
  const hashes = new Set<number>();
  const model = Model.withLogicalClock();
  for (let i = 0; i < iterations; i++) {
    const json = RandomJson.generate();
    model.api.root(json);
    const hash1 = hashNode(model.root);
    const hash2 = hashNode(model.root);
    expect(hash1).toBe(hash2);
    hashes.add(hash1);
  }
  expect(hashes.size).toBe(iterations);
});
