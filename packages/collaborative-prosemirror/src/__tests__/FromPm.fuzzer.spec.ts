import {assertCanConvert} from './setup';
import {NodeToViewRangeFuzzer} from './fuzzer';

test('fuzzer', () => {
  for (let i = 0; i < 100; i++) {
    const doc = NodeToViewRangeFuzzer.doc();
    assertCanConvert(doc);
    assertCanConvert(doc);
  }
});
