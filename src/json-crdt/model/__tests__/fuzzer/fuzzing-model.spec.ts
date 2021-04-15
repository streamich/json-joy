import {ModelFuzzer} from './ModelFuzzer';

const runs = 50;
const sessionNum = 50;

test('model fuzz testing', () => {
  for (let r = 0; r < runs; r++) {
    const fuzzer = new ModelFuzzer();
    fuzzer.setupModel();
    // console.log(fuzzer.model.toJson());
    for (let ses = 0; ses < sessionNum; ses++) {
      const session = fuzzer.executeConcurrentSession();
      // console.log(fuzzer.model.toJson());
      const json = session.models[0].toJson();
      for (let i = 1; i < session.models.length; i++) {
        expect(json).toEqual(session.models[i].toJson());
      }
    }
  }
});
