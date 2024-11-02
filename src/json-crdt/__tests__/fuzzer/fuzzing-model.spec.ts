import {JsonCrdtFuzzer} from './JsonCrdtFuzzer';

const runs = 10;
const sessionNum = 25;

test('model fuzz testing', () => {
  for (let r = 0; r < runs; r++) {
    const fuzzer = new JsonCrdtFuzzer();
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
