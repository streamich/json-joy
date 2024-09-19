import {tests} from './tests';

export const runDeepEqualTestSuite = (deepEqual: (a: unknown, b: unknown) => boolean) => {
  for (const s of tests) {
    describe(s.description, () => {
      for (const t of s.tests) {
        test(t.description, () => {
          const res1 = deepEqual(t.value1, t.value2);
          const res2 = deepEqual(t.value2, t.value1);
          try {
            expect(res1).toBe(t.equal);
            expect(res2).toBe(t.equal);
          } catch (error) {
            throw error;
          }
        });
      }
    });
  }
};
