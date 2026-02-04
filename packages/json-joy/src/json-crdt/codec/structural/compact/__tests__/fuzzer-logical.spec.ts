import {JsonCrdtFuzzer} from '../../../../__tests__/fuzzer/JsonCrdtFuzzer';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {assertParents} from '../../../../model/__tests__/util';

const encoder = new Encoder();
const decoder = new Decoder();

const runs = 10;
const sessionNum = 10;

test('serialization fuzzing tests', () => {
  for (let r = 0; r < runs; r++) {
    const fuzzer = new JsonCrdtFuzzer({testCodecs: false});
    fuzzer.setupModel();
    for (let ses = 0; ses < sessionNum; ses++) {
      fuzzer.executeConcurrentSession();
      const json = fuzzer.model.view();
      // console.log(fuzzer.model + '');
      const encoded1 = encoder.encode(fuzzer.model);
      const doc2 = decoder.decode(encoded1);
      const encoded2 = encoder.encode(doc2);
      const doc3 = decoder.decode(encoded2);
      expect(doc2.view()).toEqual(json);
      expect(doc3.view()).toEqual(json);
      assertParents(doc2);
      assertParents(doc3);
    }
  }
});
