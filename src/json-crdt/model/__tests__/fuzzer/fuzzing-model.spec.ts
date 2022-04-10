import {ModelFuzzer} from './ModelFuzzer';

const runs = 10;
const sessionNum = 50;

for (let r = 0; r < runs; r++) {
  test(`model fuzz testing, run ${r + 1}`, () => {
    const fuzzer = new ModelFuzzer();
    fuzzer.setupModel();
    for (let ses = 0; ses < sessionNum; ses++) {
      const session = fuzzer.executeConcurrentSession();
      const json = session.models[0].toView();
      for (let i = 1; i < session.models.length; i++) {
        expect(json).toEqual(session.models[i].toView());
      }
    }
  });
}
