import {StringFuzzer} from './StringFuzzer';

const runs = 1000;
const sessionNum = 10;

test('string fuzz testing', () => {
  for (let r = 0; r < runs; r++) {
    const fuzzer = new StringFuzzer();
    fuzzer.setupModel();
    for (let ses = 0; ses < sessionNum; ses++) {
      const session = fuzzer.executeConcurrentSession();
      const json = session.models[0].toJson();
      for (let i = 1; i < session.models.length; i++) {
        expect(json).toEqual(session.models[i].toJson());
      }
    }
  }
});
