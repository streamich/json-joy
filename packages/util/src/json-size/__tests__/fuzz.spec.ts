import {jsonSize} from '..';
import {RandomJson} from '@jsonjoy.com/json-random/lib/RandomJson';
import {utf8Size} from '../../strings/utf8';

const random = new RandomJson();
const iterations = 100;

for (let i = 0; i < iterations; i++) {
  test(`calculates json size - ${i + 1}`, () => {
    const json = random.create();
    // console.log(json);
    const size1 = jsonSize(json);
    const size2 = utf8Size(JSON.stringify(json));
    expect(size1).toBe(size2);
  });
}
