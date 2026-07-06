import {RandomJson} from '@jsonjoy.com/json-random';
import {assertStructHash} from './assertStructHash';

const iterations = 100;

test('computes structural hashes', () => {
  for (let i = 0; i < iterations; i++) {
    const json = RandomJson.generate();
    assertStructHash(json);
  }
});
