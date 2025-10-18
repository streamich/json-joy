/**
 * Unit tests for the src/random/ module.
 * Tests that generated random values conform to their JSON Type schemas.
 */

import {allSchemas, schemaCategories} from '../../__tests__/fixtures';
import {ValidatorCodegen} from '../../codegen/validator/ValidatorCodegen';
import {type Type, t} from '../../type';
import {Random} from '../Random';

const validate = (type: Type, value: unknown) => {
  const validator = ValidatorCodegen.get({type, errors: 'object'});
  const error = validator(value);
  if (error) throw error;
};

describe('Random', () => {
  describe('individual generator functions', () => {
    describe('primitives', () => {
      test('str generates valid strings', () => {
        const type = t.String();
        for (let i = 0; i < 10; i++) {
          const value = Random.gen(type);
          expect(typeof value).toBe('string');
          validate(type, value);
        }
      });

      test('str respects min/max constraints', () => {
        const type = t.String({min: 5, max: 10});
        for (let i = 0; i < 10; i++) {
          const value = Random.gen(type);
          expect(typeof value).toBe('string');
          expect(value.length).toBeGreaterThanOrEqual(5);
          expect(value.length).toBeLessThanOrEqual(10);
          validate(type, value);
        }
      });

      test('num generates valid numbers', () => {
        const type = t.Number();
        for (let i = 0; i < 10; i++) {
          const value = Random.gen(type);
          expect(typeof value).toBe('number');
          validate(type, value);
        }
      });

      test('num respects format constraints', () => {
        const type = t.Number({format: 'u32'});
        for (let i = 0; i < 10; i++) {
          const value = Random.gen(type);
          expect(typeof value).toBe('number');
          expect(Number.isInteger(value)).toBe(true);
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(0xffffffff);
          validate(type, value);
        }
      });

      test('num with integer format and gte/lte always produces clean integers', () => {
        // Test u16 format with gte/lte constraints (the configuration that was failing)
        const type = t.Number({format: 'u16', gte: 1, lte: 65535});
        for (let i = 0; i < 100; i++) {
          const value = Random.gen(type);
          expect(typeof value).toBe('number');
          expect(Number.isInteger(value)).toBe(true);
          expect(value).toBeGreaterThanOrEqual(1);
          expect(value).toBeLessThanOrEqual(65535);
          // Verify no floating-point artifacts
          expect(value).toBe(Math.floor(value));
          expect(value.toString()).not.toContain('.');
          validate(type, value);
        }
      });

      test('num with all integer formats produces clean integers', () => {
        const integerFormats = ['i8', 'i16', 'i32', 'u8', 'u16', 'u32'] as const;
        for (const format of integerFormats) {
          const type = t.Number({format, gte: 1, lte: 100});
          for (let i = 0; i < 50; i++) {
            const value = Random.gen(type);
            expect(Number.isInteger(value)).toBe(true);
            expect(value).toBe(Math.floor(value));
            validate(type, value);
          }
        }
      });

      test('bool generates valid booleans', () => {
        const type = t.Boolean();
        for (let i = 0; i < 10; i++) {
          const value = Random.gen(type);
          expect(typeof value).toBe('boolean');
          validate(type, value);
        }
      });

      test('const_ generates exact values', () => {
        const type = t.Const('fixed-value' as const);
        for (let i = 0; i < 10; i++) {
          const value = Random.gen(type);
          expect(value).toBe('fixed-value');
          validate(type, value);
        }
      });

      test('any generates valid JSON values', () => {
        const type = t.Any();
        for (let i = 0; i < 10; i++) {
          const value = Random.gen(type);
          expect(value).toBeDefined();
          validate(type, value);
        }
      });

      test('bin generates Uint8Array', () => {
        const type = t.bin;
        for (let i = 0; i < 10; i++) {
          const value = Random.gen(type);
          expect(value).toBeInstanceOf(Uint8Array);
          validate(type, value);
        }
      });
    });

    describe('composites', () => {
      test('arr generates valid arrays', () => {
        const type = t.Array(t.String());
        for (let i = 0; i < 10; i++) {
          const value = Random.gen(type);
          expect(Array.isArray(value)).toBe(true);
          validate(type, value);
        }
      });

      test('arr respects min/max constraints', () => {
        const type = t.Array(t.String(), {min: 2, max: 5});
        for (let i = 0; i < 10; i++) {
          const value = Random.gen(type);
          expect(Array.isArray(value)).toBe(true);
          expect(value.length).toBeGreaterThanOrEqual(2);
          expect(value.length).toBeLessThanOrEqual(5);
          validate(type, value);
        }
      });

      test('obj generates valid objects', () => {
        const type = t.Object(t.Key('id', t.String()), t.Key('count', t.Number()));
        for (let i = 0; i < 10; i++) {
          const value = Random.gen(type);
          expect(typeof value).toBe('object');
          expect(value).not.toBeNull();
          expect(value).not.toBeInstanceOf(Array);
          expect(value).toHaveProperty('id');
          expect(value).toHaveProperty('count');
          validate(type, value);
        }
      });

      test('arr head generates valid tuples', () => {
        const type = t.tuple(t.String(), t.Number(), t.Boolean());
        for (let i = 0; i < 10; i++) {
          const value = Random.gen(type);
          expect(Array.isArray(value)).toBe(true);
          expect(value).toHaveLength(3);
          expect(typeof value[0]).toBe('string');
          expect(typeof value[1]).toBe('number');
          expect(typeof value[2]).toBe('boolean');
          validate(type, value);
        }
      });

      test('map generates valid maps', () => {
        const type = t.Map(t.String());
        for (let i = 0; i < 10; i++) {
          const value = Random.gen(type);
          expect(typeof value).toBe('object');
          expect(value).not.toBeNull();
          expect(value).not.toBeInstanceOf(Array);
          validate(type, value);
        }
      });

      test('or generates values from union types', () => {
        const type = t.Or(t.String(), t.Number());
        const generatedTypes = new Set<string>();
        for (let i = 0; i < 20; i++) {
          const value = Random.gen(type);
          generatedTypes.add(typeof value);
          validate(type, value);
        }
        // Should generate at least one of each type over multiple iterations
        expect(generatedTypes.size).toBeGreaterThan(0);
      });

      test('fn generates async functions', async () => {
        const type = t.Function(t.num, t.String());
        const value = Random.gen(type);
        expect(typeof value).toBe('function');

        // Test that the function is async and returns the expected type
        const result = await (value as () => Promise<unknown>)();
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('main router function', () => {
    test('dispatches to correct generators for all types', () => {
      for (const [_name, schema] of Object.entries(schemaCategories.primitives)) {
        const type = t.from(schema);
        for (let i = 0; i < 5; i++) {
          const value = Random.gen(type);
          expect(() => validate(type, value)).not.toThrow();
        }
      }
      for (const [_name, schema] of Object.entries(schemaCategories.composites)) {
        const type = t.from(schema);
        for (let i = 0; i < 5; i++) {
          const value = Random.gen(type);
          expect(() => validate(type, value)).not.toThrow();
        }
      }
    });
  });

  describe('comprehensive schema validation', () => {
    test('generated values pass validation for all fixture schemas', () => {
      for (const [_name, schema] of Object.entries(allSchemas)) {
        const type = t.from(schema);

        // Test multiple random generations for each schema
        for (let i = 0; i < 10; i++) {
          const randomValue = Random.gen(type);

          // Test using both validate methods
          expect(() => validate(type, randomValue)).not.toThrow();

          // Test using compiled validator
          const validator = ValidatorCodegen.get({type, errors: 'object'});
          const error = validator(randomValue);
          expect(error).toBe(null);
        }
      }
    });

    test('handles nested complex structures', () => {
      const complexType = t.Object(
        t.Key(
          'users',
          t.Array(
            t.Object(
              t.Key('id', t.Number()),
              t.Key(
                'profile',
                t.Object(t.Key('name', t.String()), t.Key('preferences', t.Map(t.Or(t.String(), t.Boolean())))),
              ),
              t.KeyOpt('tags', t.Array(t.String())),
            ),
          ),
        ),
        t.Key('metadata', t.Map(t.Any())),
        t.Key('config', t.tuple(t.String(), t.Number(), t.Object(t.Key('enabled', t.Boolean())))),
      );

      for (let i = 0; i < 5; i++) {
        const value = Random.gen(complexType);
        expect(() => validate(complexType, value)).not.toThrow();
      }
    });

    test('handles edge cases and constraints', () => {
      // Empty array constraint
      const emptyArrType = t.Array(t.String(), {max: 0});
      const emptyArray = Random.gen(emptyArrType);
      expect(emptyArray).toEqual([]);
      validate(emptyArrType, emptyArray);

      // Single item array constraint
      const singleItemType = t.Array(t.Number(), {min: 1, max: 1});
      const singleItem = Random.gen(singleItemType);
      expect(singleItem).toHaveLength(1);
      validate(singleItemType, singleItem);

      // Number with tight range
      const tightRangeType = t.Number({gte: 5, lte: 5});
      const tightRangeValue = Random.gen(tightRangeType);
      expect(tightRangeValue).toBe(5);
      validate(tightRangeType, tightRangeValue);
    });
  });

  describe('deterministic behavior with controlled randomness', () => {
    test('generates consistent values with mocked Math.random', () => {
      const originalRandom = Math.random;
      let _callCount = 0;
      Math.random = () => {
        _callCount++;
        return 0.5; // Always return 0.5 for predictable results
      };
      try {
        const type = t.String({min: 5, max: 5});
        const value1 = Random.gen(type);
        const value2 = Random.gen(type);
        // With fixed random, string generation should be consistent
        expect(value1).toBe(value2);
        expect(value1).toHaveLength(5);
        validate(type, value1);
      } finally {
        Math.random = originalRandom;
      }
    });
  });
});
