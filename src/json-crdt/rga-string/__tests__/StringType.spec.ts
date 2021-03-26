import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {Document} from '../../document';
import {StringType} from '../StringType';

test('merges sequential chunks', () => {
  const doc = new Document();
  const builder1 = new PatchBuilder(doc.clock);

  const str = builder1.str();
  builder1.root(str);
  doc.applyPatch(builder1.patch);
  
  const builder2 = new PatchBuilder(doc.clock);
  const ins1 = builder2.insStr(str, str, '12');
  doc.applyPatch(builder2.patch);

  const builder3 = new PatchBuilder(doc.clock);
  const ins2 = builder3.insStr(str, ins1.tick(1), '34');
  doc.applyPatch(builder3.patch);

  const node = doc.nodes.get(str) as StringType;
  const origin = node.start;
  const firstChunk = origin.right;

  expect(firstChunk!.str).toBe('1234');
  expect(doc.toJson()).toBe('1234');
});
