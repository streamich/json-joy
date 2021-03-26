import {FALSE_ID, TRUE_ID} from '../../../json-crdt-patch/constants';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {Document} from '../../document';
import {ArrayType} from '../ArrayType';

test('merges sequential chunks', () => {
  const doc = new Document();
  const builder1 = new PatchBuilder(doc.clock);

  const arr = builder1.arr();
  builder1.root(arr);
  doc.applyPatch(builder1.patch);
  
  const builder2 = new PatchBuilder(doc.clock);
  const ins1 = builder2.insArr(arr, arr, [TRUE_ID]);
  doc.applyPatch(builder2.patch);

  const builder3 = new PatchBuilder(doc.clock);
  const ins2 = builder3.insArr(arr, ins1, [FALSE_ID]);
  doc.applyPatch(builder3.patch);

  const node = doc.nodes.get(arr) as ArrayType;
  const origin = node.start;
  const firstChunk = origin.right;

  expect(firstChunk!.values!.length).toBe(2);
  expect(doc.toJson()).toEqual([true, false]);
});
