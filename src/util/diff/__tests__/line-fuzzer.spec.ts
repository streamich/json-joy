import {RandomJson} from '@jsonjoy.com/util/lib/json-random';
import {assertDiff} from './line';

const iterations = 1000;
const minElements = 2;
const maxElements = 6;

test('produces valid patch', () => {
  for (let i = 0; i < iterations; i++) {
    const elements = minElements + Math.ceil(Math.random() * (maxElements - minElements));
    const src: string[] = [];
    const dst: string[] = [];
    for (let i = 0; i < elements; i++) {
      const json = RandomJson.generate({nodeCount: 5});
      if (Math.random() > 0.5) {
        src.push(JSON.stringify(json));
      }
      if (Math.random() > 0.5) {
        dst.push(JSON.stringify(json));
      }
    }
    try {
      assertDiff(src, dst);
    } catch (error) {
      console.log('SRC', src);
      console.log('DST', dst);
      throw error;
    }
  }
});
