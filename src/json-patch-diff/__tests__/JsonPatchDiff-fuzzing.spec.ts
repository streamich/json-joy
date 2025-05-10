import {assertDiff, randomArray} from './util';

const iterations = 100;

test('two random arrays of integers', () => {
  for (let i = 0; i < iterations; i++) {
    const src = randomArray();
    const dst = randomArray();
    try {
      assertDiff(src, dst);
    } catch (error) {
      console.error('src', src);
      console.error('dst', dst);
      throw error;
    }
  }
});
