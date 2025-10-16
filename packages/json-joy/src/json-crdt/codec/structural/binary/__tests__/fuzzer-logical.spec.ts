import {JsonCrdtFuzzer} from '../../../../__tests__/fuzzer/JsonCrdtFuzzer';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {ViewDecoder} from '../ViewDecoder';

const encoder = new Encoder();
const decoder = new Decoder();
const viewDecoder = new ViewDecoder();

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
      const json2 = viewDecoder.decode(encoded2);
      expect(doc2.view()).toEqual(json);
      expect(doc3.view()).toEqual(json);
      expect(json2).toEqual(json);
    }
  }
});
