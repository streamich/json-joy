/* tslint:disable no-console */

import {JsonCrdtFuzzer} from './JsonCrdtFuzzer';

const runs = 25;
const sessionNum = 10;

test('string fuzz testing', () => {
  for (let r = 0; r < runs; r++) {
    const fuzzer = new JsonCrdtFuzzer({startingValue: ''});
    fuzzer.setupModel();
    for (let ses = 0; ses < sessionNum; ses++) {
      const session = fuzzer.executeConcurrentSession();
      const json = session.models[0].view();
      for (let i = 1; i < session.models.length; i++) {
        try {
          expect(json).toEqual(session.models[i].view());
        } catch (error) {
          console.log('Fuzzer:');
          console.log(fuzzer.model.toString());
          let i = 0;
          for (const model of session.models) {
            console.log(`Peer ${i}:`);
            console.log(model.toString());
            i++;
          }
          console.log(
            JSON.stringify({
              modelStart: session.modelStart,
              modelsStart: session.modelsStart,
              modelsEnd: session.modelsEnd,
              patchesSerialized: session.patchesSerialized,
            }),
          );
          throw error;
        }
      }
    }
  }
});
