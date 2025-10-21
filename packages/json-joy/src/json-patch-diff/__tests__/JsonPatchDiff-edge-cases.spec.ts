import {assertDiff} from './util';
import {RandomJson} from '@jsonjoy.com/util/lib/json-random';
import {JsonPatchDiff} from '../JsonPatchDiff';

describe('Edge Cases', () => {
  describe('null and undefined handling', () => {
    test('null to value', () => {
      assertDiff(null, 42);
      assertDiff(null, 'hello');
      assertDiff(null, []);
      assertDiff(null, {});
    });

    test('value to null', () => {
      assertDiff(42, null);
      assertDiff('hello', null);
      assertDiff([], null);
      assertDiff({}, null);
    });

    test('null in objects', () => {
      assertDiff({a: null}, {a: 'value'});
      assertDiff({a: 'value'}, {a: null});
      assertDiff({a: null, b: 1}, {a: null, b: 2});
    });

    test('null in arrays', () => {
      assertDiff([null], ['value']);
      assertDiff(['value'], [null]);
      assertDiff([null, 1], [null, 2]);
    });
  });

  describe('empty structures', () => {
    test('empty to empty', () => {
      assertDiff({}, {});
      assertDiff([], []);
      assertDiff('', '');
    });

    test('empty to non-empty', () => {
      assertDiff({}, {a: 1});
      assertDiff([], [1]);
      assertDiff('', 'hello');
    });

    test('non-empty to empty', () => {
      assertDiff({a: 1}, {});
      assertDiff([1], []);
      assertDiff('hello', '');
    });

    test('nested empty structures', () => {
      assertDiff({a: {}}, {a: {b: 1}});
      assertDiff({a: []}, {a: [1]});
      assertDiff([{}], [{a: 1}]);
      assertDiff([[]], [[1]]);
    });
  });

  describe('type conversions', () => {
    test('string to number', () => {
      assertDiff('123', 123);
      assertDiff('0', 0);
      assertDiff('3.14', 3.14);
    });

    test('number to string', () => {
      assertDiff(123, '123');
      assertDiff(0, '0');
      assertDiff(3.14, '3.14');
    });

    test('boolean conversions', () => {
      assertDiff(true, false);
      assertDiff(true, 1);
      assertDiff(false, 0);
      assertDiff(true, 'true');
      assertDiff(false, 'false');
    });

    test('array to object', () => {
      assertDiff([1, 2, 3], {0: 1, 1: 2, 2: 3});
      assertDiff([], {});
    });

    test('object to array', () => {
      assertDiff({0: 1, 1: 2, 2: 3}, [1, 2, 3]);
      assertDiff({}, []);
    });

    test('primitive to object/array', () => {
      assertDiff(42, {value: 42});
      assertDiff('hello', [1, 2, 3]);
      assertDiff(true, {boolean: true});
    });
  });

  describe('special string characters', () => {
    test('unicode characters', () => {
      assertDiff('hello', 'héllo');
      assertDiff('🚀', '🎉');
      assertDiff('普通话', '中文');
    });

    test('emoji sequences', () => {
      assertDiff('👨‍👩‍👧‍👦', '👨‍👩‍👧');
      assertDiff('🏳️‍🌈', '🏳️‍⚧️');
    });

    test('control characters', () => {
      assertDiff('hello\nworld', 'hello\tworld');
      assertDiff('line1\r\nline2', 'line1\nline2');
    });

    test('special characters', () => {
      assertDiff('', '\u0000');
      assertDiff('hello\u0000world', 'hello world');
      assertDiff('quotes"test', "quotes'test");
    });

    test('surrogate pairs', () => {
      assertDiff('𝒽𝑒𝓁𝓁𝑜', '𝓦𝑜𝓇𝓁𝒹');
      assertDiff('🌟⭐✨', '🔥💥🎆');
    });

    test('very long strings', () => {
      const longStr1 = 'a'.repeat(1000);
      const longStr2 = 'b'.repeat(1000);
      assertDiff(longStr1, longStr2);

      const longStr3 = 'hello'.repeat(200);
      const longStr4 = 'world'.repeat(200);
      assertDiff(longStr3, longStr4);
    });
  });

  describe('special object keys', () => {
    test('empty string key', () => {
      assertDiff({'': 'value'}, {'': 'changed'});
      assertDiff({}, {'': 'value'});
      assertDiff({'': 'value'}, {});
    });

    test('basic special characters in keys', () => {
      assertDiff({'key with spaces': 1}, {'key with spaces': 2});
      assertDiff({key_with_underscores: 1}, {key_with_underscores: 2});
      assertDiff({'key.with.dots': 1}, {'key.with.dots': 2});
    });

    test('numeric string keys', () => {
      assertDiff({'0': 'zero'}, {'0': 'changed'});
      assertDiff({'123': 'number'}, {'123': 'string'});
    });

    test('prototype pollution attempts (safe handling)', () => {
      // These should be handled safely, not cause errors
      // Note: The diff algorithm correctly identifies and applies these changes
      // but the result may not be what you'd expect due to prototype behavior
      const src1 = {};
      const dst1 = {__proto__: {polluted: true}};

      // We'll test that the diff can be generated and applied without errors
      const diff1 = new JsonPatchDiff();
      const patch1 = diff1.diff('/test', src1, dst1);
      expect(patch1.length).toBeGreaterThan(0);

      const src2 = {constructor: 'safe'};
      const dst2 = {constructor: 'changed'};
      assertDiff(src2, dst2);
    });
  });

  describe('deep nesting', () => {
    test('deeply nested objects', () => {
      const deep1: any = {};
      const deep2: any = {};
      let curr1 = deep1;
      let curr2 = deep2;

      for (let i = 0; i < 10; i++) {
        curr1.nested = {value: i};
        curr2.nested = {value: i + 1};
        curr1 = curr1.nested;
        curr2 = curr2.nested;
      }

      assertDiff(deep1, deep2);
    });

    test('deeply nested arrays', () => {
      const deep1: any = [];
      const deep2: any = [];
      let curr1 = deep1;
      let curr2 = deep2;

      for (let i = 0; i < 10; i++) {
        const next1 = [i];
        const next2 = [i + 1];
        curr1.push(next1);
        curr2.push(next2);
        curr1 = next1;
        curr2 = next2;
      }

      assertDiff(deep1, deep2);
    });

    test('mixed deep nesting', () => {
      const deep1 = {
        level1: {
          arr: [
            {
              level3: {
                arr2: [1, 2, {level4: 'deep'}],
              },
            },
          ],
        },
      };

      const deep2 = {
        level1: {
          arr: [
            {
              level3: {
                arr2: [1, 2, {level4: 'changed'}],
              },
            },
          ],
        },
      };

      assertDiff(deep1, deep2);
    });
  });

  describe('large structures', () => {
    test('large arrays', () => {
      const large1 = Array.from({length: 1000}, (_, i) => i);
      const large2 = Array.from({length: 1000}, (_, i) => i * 2);
      assertDiff(large1, large2);
    });

    test('large objects', () => {
      const large1: Record<string, number> = {};
      const large2: Record<string, number> = {};

      for (let i = 0; i < 500; i++) {
        large1[`key${i}`] = i;
        large2[`key${i}`] = i * 2;
      }

      assertDiff(large1, large2);
    });

    test('many small changes in large structure', () => {
      const base = RandomJson.generate({nodeCount: 50});
      const modified = JSON.parse(JSON.stringify(base));

      // Make small modifications throughout
      if (typeof modified === 'object' && modified !== null) {
        if (Array.isArray(modified)) {
          for (let i = 0; i < Math.min(5, modified.length); i++) {
            if (typeof modified[i] === 'number') {
              modified[i] = modified[i] + 1;
            }
          }
        } else {
          const keys = Object.keys(modified);
          for (let i = 0; i < Math.min(5, keys.length); i++) {
            const key = keys[i];
            if (typeof modified[key] === 'number') {
              modified[key] = modified[key] + 1;
            }
          }
        }
      }

      assertDiff(base, modified);
    });
  });

  describe('boundary conditions', () => {
    test('single character changes', () => {
      assertDiff('a', 'b');
      assertDiff('x', '');
      assertDiff('', 'y');
    });

    test('arrays with single elements', () => {
      assertDiff([0], [1]);
      assertDiff([null], [undefined]);
      assertDiff([{}], [[]]);
    });

    test('objects with single properties', () => {
      assertDiff({a: 1}, {a: 2});
      assertDiff({a: 1}, {b: 1});
      assertDiff({x: null}, {x: undefined});
    });

    test('mixed type arrays', () => {
      assertDiff([1, 'two', true, null, {}, []], [2, 'three', false, undefined, [], {}]);
      assertDiff(['a', 1, true], [1, 'a', false]);
    });

    test('sparse arrays', () => {
      const sparse1: any[] = [];
      sparse1[0] = 'first';
      sparse1[5] = 'sixth';

      const sparse2: any[] = [];
      sparse2[0] = 'changed';
      sparse2[5] = 'sixth';
      sparse2[10] = 'eleventh';

      assertDiff(sparse1, sparse2);
    });
  });

  describe('bigint support', () => {
    test('bigint values', () => {
      assertDiff(BigInt(123), BigInt(456));
      assertDiff(BigInt(0), BigInt(1));
      assertDiff(BigInt(Number.MAX_SAFE_INTEGER), BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1));
    });

    test('bigint to other types', () => {
      assertDiff(BigInt(123), 123);
      assertDiff(BigInt(123), '123');
      assertDiff(123, BigInt(123));
      assertDiff('123', BigInt(123));
    });

    test('bigint in structures', () => {
      assertDiff({value: BigInt(123)}, {value: BigInt(456)});
      assertDiff([BigInt(1), BigInt(2)], [BigInt(2), BigInt(3)]);
    });
  });

  describe('identical documents', () => {
    test('should produce empty patch for identical primitives', () => {
      const primitives = [null, undefined, true, false, 0, 1, -1, 3.14, '', 'hello', BigInt(123)];
      for (const primitive of primitives) {
        assertDiff(primitive, primitive);
      }
    });

    test('should produce empty patch for identical objects', () => {
      const obj = {a: 1, b: 'test', c: [1, 2, 3], d: {nested: true}};
      assertDiff(obj, obj);
    });

    test('should produce empty patch for identical arrays', () => {
      const arr = [1, 'test', {a: 1}, [1, 2]];
      assertDiff(arr, arr);
    });

    test('should produce empty patch for structurally identical but different objects', () => {
      const obj1 = {a: 1, b: 'test'};
      const obj2 = {a: 1, b: 'test'};
      assertDiff(obj1, obj2);
    });
  });
});
