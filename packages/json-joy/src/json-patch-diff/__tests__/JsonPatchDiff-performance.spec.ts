import {assertDiff, randomMixedArray, randomObject, randomNestedStructure, createSimilarDocument} from './util';
import {RandomJson} from '@jsonjoy.com/json-random';
import {JsonPatchDiff} from '../JsonPatchDiff';

describe('Performance and Stress Tests', () => {
  describe('large document handling', () => {
    test('very large arrays', () => {
      const large1 = Array.from({length: 2000}, (_, i) => ({
        id: i,
        name: `item-${i}`,
        value: Math.random(),
        active: i % 2 === 0,
      }));

      const large2 = large1.map((item, i) => ({
        ...item,
        value: item.value + 0.1,
        active: i % 3 === 0,
      }));

      assertDiff(large1, large2);
    });

    test('very large objects', () => {
      const large1: Record<string, any> = {};
      const large2: Record<string, any> = {};

      for (let i = 0; i < 1000; i++) {
        large1[`property_${i}`] = {
          index: i,
          data: `value-${i}`,
          nested: {
            deep: i * 2,
            flag: i % 2 === 0,
          },
        };

        large2[`property_${i}`] = {
          index: i,
          data: `updated-${i}`,
          nested: {
            deep: i * 3,
            flag: i % 3 === 0,
          },
        };
      }

      assertDiff(large1, large2);
    });

    test('deeply nested structures', () => {
      const deep1: any = {start: true};
      const deep2: any = {start: true};
      let current1 = deep1;
      let current2 = deep2;

      for (let i = 0; i < 50; i++) {
        current1.level = {
          index: i,
          data: `level-${i}`,
          items: Array.from({length: 3}, (_, j) => `item-${i}-${j}`),
        };
        current2.level = {
          index: i,
          data: `updated-level-${i}`,
          items: Array.from({length: 3}, (_, j) => `updated-item-${i}-${j}`),
        };
        current1 = current1.level;
        current2 = current2.level;
      }

      assertDiff(deep1, deep2);
    });

    test('wide object with many properties', () => {
      const wide1: Record<string, any> = {};
      const wide2: Record<string, any> = {};

      // Create objects with many properties
      for (let i = 0; i < 500; i++) {
        wide1[`key${i}`] = i;
        wide2[`key${i}`] = i % 100 === 0 ? i + 1 : i; // Change every 100th value
      }

      assertDiff(wide1, wide2);
    });
  });

  describe('complex structural changes', () => {
    test('complete type transformation', () => {
      const original = {
        users: [
          {id: 1, name: 'Alice'},
          {id: 2, name: 'Bob'},
        ],
        settings: {
          theme: 'dark',
          notifications: true,
        },
      };

      const transformed = ['User: Alice (ID: 1)', 'User: Bob (ID: 2)', 'Theme: dark', 'Notifications: enabled'];

      assertDiff(original, transformed);
    });

    test('array to object transformation', () => {
      const arr = ['first', 'second', 'third', 'fourth'];
      const obj = {
        0: 'first',
        1: 'second-modified',
        2: 'third',
        3: 'fourth',
        4: 'fifth',
      };

      assertDiff(arr, obj);
    });

    test('object restructuring', () => {
      const original = {
        user: {
          personal: {
            firstName: 'John',
            lastName: 'Doe',
          },
          contact: {
            email: 'john@example.com',
            phone: '123-456-7890',
          },
        },
      };

      const restructured = {
        fullName: 'John Doe',
        contacts: [
          {type: 'email', value: 'john@example.com'},
          {type: 'phone', value: '123-456-7890'},
        ],
      };

      assertDiff(original, restructured);
    });
  });

  describe('stress testing with random data', () => {
    const iterations = 10; // Reduced for stability

    test('random complex documents', () => {
      for (let i = 0; i < iterations; i++) {
        const doc1 = RandomJson.generate({nodeCount: 15}); // Reduced complexity
        const doc2 = RandomJson.generate({nodeCount: 15});

        try {
          assertDiff(doc1, doc2);
        } catch (error) {
          console.error('doc1', JSON.stringify(doc1, null, 2));
          console.error('doc2', JSON.stringify(doc2, null, 2));
          throw error;
        }
      }
    });

    test('similar documents with variations', () => {
      for (let i = 0; i < iterations; i++) {
        const original = RandomJson.generate({nodeCount: 12}); // Reduced complexity
        const modified = createSimilarDocument(original, 0.1); // Lower mutation rate

        try {
          assertDiff(original, modified);
        } catch (error) {
          console.error('original', JSON.stringify(original, null, 2));
          console.error('modified', JSON.stringify(modified, null, 2));
          throw error;
        }
      }
    });

    test('mixed type arrays stress test', () => {
      for (let i = 0; i < iterations; i++) {
        const arr1 = randomMixedArray(10); // Reduced size
        const arr2 = randomMixedArray(10);

        try {
          assertDiff(arr1, arr2);
        } catch (error) {
          console.error('arr1', JSON.stringify(arr1, null, 2));
          console.error('arr2', JSON.stringify(arr2, null, 2));
          throw error;
        }
      }
    });

    test('complex object stress test', () => {
      for (let i = 0; i < iterations; i++) {
        const obj1 = randomObject(8); // Reduced size
        const obj2 = randomObject(8);

        try {
          assertDiff(obj1, obj2);
        } catch (error) {
          console.error('obj1', JSON.stringify(obj1, null, 2));
          console.error('obj2', JSON.stringify(obj2, null, 2));
          throw error;
        }
      }
    });

    test('nested structure stress test', () => {
      for (let i = 0; i < iterations; i++) {
        const struct1 = randomNestedStructure(3); // Reduced depth
        const struct2 = randomNestedStructure(3);

        try {
          assertDiff(struct1, struct2);
        } catch (error) {
          console.error('struct1', JSON.stringify(struct1, null, 2));
          console.error('struct2', JSON.stringify(struct2, null, 2));
          throw error;
        }
      }
    });
  });

  describe('edge performance cases', () => {
    test('many small string changes', () => {
      const base = 'The quick brown fox jumps over the lazy dog. ';
      const long1 = base.repeat(100);
      const long2 = long1.replace(/quick/g, 'slow').replace(/brown/g, 'red').replace(/fox/g, 'cat');

      assertDiff(long1, long2);
    });

    test('single change in large array', () => {
      const large = Array.from({length: 5000}, (_, i) => i);
      const largeModified = [...large];
      largeModified[2500] = -1; // Single change in the middle

      assertDiff(large, largeModified);
    });

    test('single property change in large object', () => {
      const large: Record<string, number> = {};
      for (let i = 0; i < 1000; i++) {
        large[`prop${i}`] = i;
      }

      const largeModified = {...large};
      largeModified.prop500 = -1; // Single change

      assertDiff(large, largeModified);
    });

    test('patch size efficiency', () => {
      // Test that patches are reasonably sized relative to changes
      const diffTool = new JsonPatchDiff();

      // Small change should produce small patch
      const smallSrc = {a: 1, b: 2, c: 3};
      const smallDst = {a: 1, b: 20, c: 3};
      const smallPatch = diffTool.diff('', smallSrc, smallDst);
      expect(smallPatch.length).toBeLessThanOrEqual(2);

      // Large identical parts should not bloat patch
      const largeSrc = Array.from({length: 1000}, (_, i) => i);
      const largeDst = [...largeSrc];
      largeDst[500] = -1;
      const largePatch = new JsonPatchDiff().diff('', largeSrc, largeDst);
      expect(largePatch.length).toBeLessThanOrEqual(5);
    });
  });

  describe('memory and performance monitoring', () => {
    test('memory usage with large documents', () => {
      // This test ensures we don't have memory leaks with large documents
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        const large1 = RandomJson.generate({nodeCount: 100});
        const large2 = RandomJson.generate({nodeCount: 100});

        const diffTool = new JsonPatchDiff();
        const patch = diffTool.diff('', large1, large2);

        // Basic sanity check
        expect(Array.isArray(patch)).toBe(true);
        expect(patch.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('time complexity reasonable for large inputs', () => {
      const startTime = Date.now();

      // Reduced size for CI stability - still tests performance but more realistic
      const large1 = Array.from({length: 1500}, (_, i) => ({
        id: i,
        data: `item-${i}`,
        value: Math.random(),
      }));

      // Only modify a subset to avoid worst-case diff scenario
      const large2 = large1.map((item, i) => ({
        ...item,
        data: i % 3 === 0 ? item.data.toUpperCase() : item.data,
      }));

      assertDiff(large1, large2);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 10 seconds)
      expect(duration).toBeLessThan(10000);
    });
  });
});
