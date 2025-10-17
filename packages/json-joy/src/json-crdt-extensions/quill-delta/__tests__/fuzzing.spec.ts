import {QuillDeltaFuzzer} from './QuillDeltaFuzzer';
import {Model} from '../../../json-crdt/model';
import {quill as QuillDeltaExt} from '..';

for (let j = 0; j < 250; j++) {
  test('fuzz - ' + j, () => {
    const model = Model.create();
    model.ext.register(QuillDeltaExt);
    model.api.set(QuillDeltaExt.new(''));
    const quill = model.api.in().asExt(QuillDeltaExt);
    const fuzzer = new QuillDeltaFuzzer({
      maxOperationsPerPatch: 3,
    });
    for (let i = 0; i < 50; i++) {
      const patch = fuzzer.createPatch();
      quill.apply(patch);
      fuzzer.applyPatch();
    }
    // console.log(quill.view());
    // console.log(fuzzer.trace().contents.ops);
    // console.log(fuzzer.trace().transactions);
    try {
      expect(quill.view()).toEqual(fuzzer.trace().contents.ops);
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(JSON.stringify(fuzzer.trace()));
      throw error;
    }
    // console.log(fuzzer.trace(), fuzzer.trace().contents.ops);
    // console.log(JSON.stringify(fuzzer.trace().transactions, null, 2));
  });
}
