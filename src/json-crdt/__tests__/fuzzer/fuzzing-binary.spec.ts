import {JsonCrdtFuzzer} from './JsonCrdtFuzzer';

const runs = 25;
const sessionNum = 10;

test('binary fuzz testing', () => {
  for (let r = 0; r < runs; r++) {
    const fuzzer = new JsonCrdtFuzzer({
      startingValue: new Uint8Array(0),
      binaryDeleteProbability: 0.5,
    });
    fuzzer.setupModel();
    for (let ses = 0; ses < sessionNum; ses++) {
      const session = fuzzer.executeConcurrentSession();
      const json = session.models[0].view();
      for (let i = 1; i < session.models.length; i++) {
        expect(json).toEqual(session.models[i].view());
      }
    }
  }
});
