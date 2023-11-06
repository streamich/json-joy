import {clone} from '../../../../../json-clone';
import {apply} from '../../apply';
import {OpTree} from '../../tree';
import {JsonOtFuzzer} from './JsonOtFuzzer';

const fuzzer = new JsonOtFuzzer();

test('...', () => {
  for (let i = 0; i < 100; i++) {
    let doc;
    let tree1;
    let tree2;
    try {
      doc = fuzzer.genDoc();
      let doc2 = clone(doc);
      const op1 = fuzzer.genOp(doc);
      tree1 = OpTree.from(op1);
      doc2 = apply(doc2, op1);
      const op2 = fuzzer.genOp(doc);
      tree2 = OpTree.from(op2);
      doc2 = apply(doc2, op2);
      tree1.compose(tree2);
      const op3 = tree1.toJson();
      const doc3 = apply(doc2, op3);
      expect(doc3).toStrictEqual(doc2);
    } catch (error) {
      throw error;
    }
  }
});
