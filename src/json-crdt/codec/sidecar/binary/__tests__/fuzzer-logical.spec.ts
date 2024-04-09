import {JsonCrdtFuzzer} from '../../../../__tests__/fuzzer/JsonCrdtFuzzer';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';

const encoder = new Encoder();
const decoder = new Decoder();
const cborDecoder = new CborDecoder();

const runs = 10;
const sessionNum = 5;

test('serialization fuzzing tests', () => {
  for (let r = 0; r < runs; r++) {
    const fuzzer = new JsonCrdtFuzzer({
      testCodecs: false,
      noProtoString: true,
    });
    fuzzer.setupModel();
    for (let ses = 0; ses < sessionNum; ses++) {
      fuzzer.executeConcurrentSession();
      const model = fuzzer.model;
      const json = model.view();
      const [view, sidecar] = encoder.encode(model);
      const model2 = decoder.decode(cborDecoder.read(view), sidecar);
      expect(model.view()).toEqual(json);
      expect(model2.view()).toEqual(json);
    }
  }
});
