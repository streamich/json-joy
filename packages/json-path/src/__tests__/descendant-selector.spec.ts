/**
 * Tests for descendant selector behavior according to RFC 9535
 *
 * RFC 9535 Section 2.5.2: Descendant Segment
 * - `..` on its own is NOT valid (Section 2.5.2.1)
 * - `$..*` is shorthand for `$..[*]` - selects all descendants
 * - `..name` is shorthand for `..['name']` - selects named descendants
 */

import {JsonPathEval} from '../JsonPathEval';
import {JsonPathCodegen} from '../JsonPathCodegen';

describe('Descendant Selector Specification Compliance', () => {
  const testData = {
    store: {
      book: [
        {title: 'Book 1', price: 10},
        {title: 'Book 2', price: 20},
      ],
      bicycle: {color: 'red', price: 100},
    },
  };

  describe('Invalid patterns', () => {
    test('$.. should throw error (RFC 9535 Section 2.5.2.1)', () => {
      expect(() => JsonPathEval.run('$..', testData)).toThrow('Expected selector after ..');
      expect(() => JsonPathCodegen.compile('$..')(testData)).toThrow('Expected selector after ..');
    });
  });

  describe('$..*', () => {
    test('should select all descendants', () => {
      const result = JsonPathEval.run('$..*', testData);

      // Should include all member values and array elements at all levels
      const values = result.map((r) => r.data);

      // Top level object members
      expect(values).toContainEqual(testData.store);

      // Store members
      expect(values).toContainEqual(testData.store.book);
      expect(values).toContainEqual(testData.store.bicycle);

      // Book array elements
      expect(values).toContainEqual(testData.store.book[0]);
      expect(values).toContainEqual(testData.store.book[1]);

      // Book properties (primitives)
      expect(values).toContain('Book 1');
      expect(values).toContain(10);
      expect(values).toContain('Book 2');
      expect(values).toContain(20);

      // Bicycle properties
      expect(values).toContain('red');
      expect(values).toContain(100);
    });

    test('should match $..[*]', () => {
      const wildcardResult = JsonPathEval.run('$..[*]', testData);
      const shorthandResult = JsonPathEval.run('$..*', testData);

      expect(shorthandResult.length).toBe(wildcardResult.length);
    });
  });

  describe('..name selector', () => {
    test('should select all descendants with specific name', () => {
      const result = JsonPathEval.run('$..price', testData);
      const prices = result.map((r) => r.data);

      expect(prices).toHaveLength(3);
      expect(prices).toContain(10);
      expect(prices).toContain(20);
      expect(prices).toContain(100);
    });

    test('should be equivalent to ..["name"]', () => {
      const dotResult = JsonPathEval.run('$..title', testData);
      const bracketResult = JsonPathEval.run('$..["title"]', testData);

      expect(dotResult.map((r) => r.data)).toEqual(bracketResult.map((r) => r.data));
    });
  });

  describe('..[index] selector', () => {
    test('should select all array elements at given index across all arrays', () => {
      const result = JsonPathEval.run('$..[0]', testData);
      const values = result.map((r) => r.data);

      // Should include first element of book array
      expect(values).toContainEqual(testData.store.book[0]);
    });
  });

  describe('Complex descendant queries', () => {
    test('$..*  should include deeply nested values', () => {
      const deepData = {
        a: {
          b: {
            c: {
              d: 'deep',
            },
          },
        },
      };

      const result = JsonPathEval.run('$..*', deepData);
      const values = result.map((r) => r.data);

      // Should include all levels
      expect(values).toContainEqual(deepData.a);
      expect(values).toContainEqual(deepData.a.b);
      expect(values).toContainEqual(deepData.a.b.c);
      expect(values).toContain('deep');
    });

    test('should work with arrays at multiple levels', () => {
      const arrayData = {
        items: [{values: [1, 2]}, {values: [3, 4]}],
      };

      const result = JsonPathEval.run('$..*', arrayData);
      const values = result.map((r) => r.data);

      // Should include primitive values from nested arrays
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
      expect(values).toContain(4);
    });
  });

  describe('Empty results', () => {
    test('..nonexistent should return empty array', () => {
      const result = JsonPathEval.run('$..nonexistent', testData);
      expect(result).toHaveLength(0);
    });
  });

  describe('Codegen implementation', () => {
    test('should produce same results as eval for $..*', () => {
      const evalResult = JsonPathEval.run('$..*', testData);
      const codegenResult = JsonPathCodegen.compile('$..*')(testData);

      expect(codegenResult.map((r) => r.data)).toEqual(evalResult.map((r) => r.data));
    });

    test('should produce same results as eval for ..name', () => {
      const evalResult = JsonPathEval.run('$..price', testData);
      const codegenResult = JsonPathCodegen.compile('$..price')(testData);

      expect(codegenResult.map((r) => r.data)).toEqual(evalResult.map((r) => r.data));
    });
  });
});
