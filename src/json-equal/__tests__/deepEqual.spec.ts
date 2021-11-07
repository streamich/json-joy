import {tests} from './tests';
import {deepEqual} from '../deepEqual';

for (const s of tests) {
  describe(s.description, () => {
    for (const t of s.tests) {
      test(t.description, () => {
        const res1 = deepEqual(t.value1, t.value2);
        const res2 = deepEqual(t.value1, t.value2);
        expect(res1).toBe(t.equal);
        expect(res2).toBe(t.equal);
      });
    }
  });
}
