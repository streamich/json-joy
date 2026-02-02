import * as fixtures from './fixtures';
import {assertCanConvert} from './setup';

for (const [name, fixture] of Object.entries(fixtures)) {
  test(name, () => {
    assertCanConvert(fixture);
  });
}
