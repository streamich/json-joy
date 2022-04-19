import {JsonCrdtFuzzer} from './JsonCrdtFuzzer';

const runs = 5;
const sessionNum = 50;

test(`model fuzz testing`, () => {
  for (let r = 0; r < runs; r++) {
    const fuzzer = new JsonCrdtFuzzer({
      useServerClock: true,
    });
    fuzzer.setupModel();
    for (let ses = 0; ses < sessionNum; ses++) {
      const session = fuzzer.executeConcurrentSession();
      const json = fuzzer.model.toView();
      for (let i = 1; i < session.models.length; i++) {
        expect(json).toStrictEqual(session.models[i].toView());
      }
    }
  }
});
