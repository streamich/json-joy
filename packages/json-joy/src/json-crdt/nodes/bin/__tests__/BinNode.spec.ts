import {tick} from '../../../../json-crdt-patch/clock';
import {PatchBuilder} from '../../../../json-crdt-patch/PatchBuilder';
import {Model} from '../../../model';
import type {BinNode} from '../BinNode';

test('merges sequential chunks', () => {
  const doc = Model.create();
  const builder1 = new PatchBuilder(doc.clock);

  const bin = builder1.bin();
  builder1.root(bin);
  doc.applyPatch(builder1.patch);

  const builder2 = new PatchBuilder(doc.clock);
  const ins1 = builder2.insBin(bin, bin, new Uint8Array([1, 2]));
  doc.applyPatch(builder2.patch);

  const builder3 = new PatchBuilder(doc.clock);
  const _ins2 = builder3.insBin(bin, tick(ins1, 1), new Uint8Array([3, 4]));
  doc.applyPatch(builder3.patch);

  const node = doc.index.get(bin) as BinNode;
  const firstChunk = node.first();

  expect(firstChunk!.data).toStrictEqual(new Uint8Array([1, 2, 3, 4]));
  expect(doc.view()).toStrictEqual(new Uint8Array([1, 2, 3, 4]));
});
