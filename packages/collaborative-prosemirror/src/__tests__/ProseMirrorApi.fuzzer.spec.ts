import type {Node} from 'prosemirror-model';
import {NodeToViewRangeFuzzer} from './fuzzer';
import {assertCanMergeTrain} from './setup';

test('can merge document train', () => {
  for (let i = 0; i < 3; i++) {
    const count = 3;
    const docs: Node[] = [];
    for (let i = 0; i < count; i++) {
      const doc = NodeToViewRangeFuzzer.doc();
      // logTree(doc.toJSON());
      docs.push(doc);
    }
    assertCanMergeTrain(docs);
  }
});
