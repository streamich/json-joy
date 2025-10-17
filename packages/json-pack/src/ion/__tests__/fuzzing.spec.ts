import {RandomJson} from '@jsonjoy.com/util/lib/json-random';
import {IonEncoderFast} from '../IonEncoderFast';
import {IonDecoder} from '../IonDecoder';

describe('fuzzing', () => {
  test('Amazon Ion codec with fresh instances', () => {
    for (let i = 0; i < 2000; i++) {
      const value = JSON.parse(JSON.stringify(RandomJson.generate()));
      // Create fresh instances for each iteration to avoid state corruption
      const encoder = new IonEncoderFast();
      const decoder = new IonDecoder();
      const encoded = encoder.encode(value);
      const decoded = decoder.decode(encoded);
      expect(decoded).toStrictEqual(value);
    }
  });
});
