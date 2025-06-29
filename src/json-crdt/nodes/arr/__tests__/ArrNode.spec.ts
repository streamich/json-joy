import {PatchBuilder} from '../../../../json-crdt-patch/PatchBuilder';
import {Model} from '../../../model';
import type {ArrNode} from '../ArrNode';

test('can insert two booleans into an array', () => {
  const doc = Model.create();
  const builder1 = new PatchBuilder(doc.clock);

  const arr = builder1.arr();
  builder1.root(arr);
  doc.applyPatch(builder1.patch);

  const builder2 = new PatchBuilder(doc.clock);
  const t = builder2.con(true);
  const ins1 = builder2.insArr(arr, arr, [t]);
  doc.applyPatch(builder2.patch);

  const builder3 = new PatchBuilder(doc.clock);
  const f = builder3.con(false);
  builder3.insArr(arr, ins1, [f]);
  doc.applyPatch(builder3.patch);

  const node = doc.index.get(arr) as ArrNode;
  node.first();

  expect(node.length()).toBe(2);
  expect(doc.view()).toEqual([true, false]);
});
