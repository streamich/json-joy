import {resetMathRandom} from '../../__tests__/setup';
import {deterministic} from '../../util';
import {TemplateJson} from '../TemplateJson';
import type {Template} from '../types';

describe('TemplateJson', () => {
  describe('str', () => {
    test('uses default string schema, if not provided', () => {
      deterministic(123, () => {
        expect(TemplateJson.gen(['str'])).toBe('Hi, Globe');
        expect(TemplateJson.gen('str')).toBe('Halo, World');
        expect(TemplateJson.gen('str')).toBe('Salutations, Earth!');
      });
    });

    test('generates string according to schema', () => {
      resetMathRandom();
      const str = TemplateJson.gen(['str', ['pick', 'foo', 'bar', 'baz']]);
      expect(str).toBe('foo');
    });

    test('handles complex string tokens', () => {
      resetMathRandom();
      const str = TemplateJson.gen(['str', ['list', 'prefix-', ['pick', 'a', 'b'], '-suffix']]);
      expect(str).toBe('prefix-a-suffix');
    });
  });

  describe('int', () => {
    test('uses default integer schema, if not provided', () => {
      resetMathRandom();
      expect(TemplateJson.gen('int')).toBe(-8037967800187380);
      resetMathRandom(123456);
      expect(TemplateJson.gen(['int'])).toBe(4954609332676803);
    });

    test('can specify "int" range', () => {
      resetMathRandom();
      expect(TemplateJson.gen(['int', -10, 10])).toBe(-9);
      expect(TemplateJson.gen(['int', 0, 1])).toBe(0);
      expect(TemplateJson.gen(['int', 1, 5])).toBe(4);
    });

    test('handles edge cases', () => {
      resetMathRandom();
      expect(TemplateJson.gen(['int', 0, 0])).toBe(0);
      expect(TemplateJson.gen(['int', -1, -1])).toBe(-1);
    });
  });

  describe('int64', () => {
    test('uses default int64 schema, if not provided', () => {
      resetMathRandom();
      const result = TemplateJson.gen('int64') as bigint;
      expect(typeof result).toBe('bigint');
      expect(result >= BigInt('-9223372036854775808')).toBe(true);
      expect(result <= BigInt('9223372036854775807')).toBe(true);
    });

    test('can specify int64 range', () => {
      resetMathRandom();
      const result1 = TemplateJson.gen(['int64', BigInt(-10), BigInt(10)]) as bigint;
      expect(result1.toString()).toBe('-9');

      const result2 = TemplateJson.gen(['int64', BigInt(0), BigInt(1)]) as bigint;
      expect(result2.toString()).toBe('0');

      const result3 = TemplateJson.gen(['int64', BigInt(1), BigInt(5)]) as bigint;
      expect(result3.toString()).toBe('3');
    });

    test('handles edge cases', () => {
      resetMathRandom();
      const result1 = TemplateJson.gen(['int64', BigInt(0), BigInt(0)]) as bigint;
      expect(result1.toString()).toBe('0');

      const result2 = TemplateJson.gen(['int64', BigInt(-1), BigInt(-1)]) as bigint;
      expect(result2.toString()).toBe('-1');

      const result3 = TemplateJson.gen(['int64', BigInt('1000000000000'), BigInt('1000000000000')]) as bigint;
      expect(result3.toString()).toBe('1000000000000');
    });

    test('handles very large ranges', () => {
      resetMathRandom();
      const result = TemplateJson.gen([
        'int64',
        BigInt('-9223372036854775808'),
        BigInt('9223372036854775807'),
      ]) as bigint;
      expect(typeof result).toBe('bigint');
      expect(result >= BigInt('-9223372036854775808')).toBe(true);
      expect(result <= BigInt('9223372036854775807')).toBe(true);
    });

    test('can be used in complex structures', () => {
      resetMathRandom();
      const template: any = [
        'obj',
        [
          ['id', 'int64'],
          ['timestamp', ['int64', BigInt('1000000000000'), BigInt('9999999999999')]],
        ],
      ];
      const result = TemplateJson.gen(template) as any;
      expect(typeof result).toBe('object');
      expect(typeof result.id).toBe('bigint');
      expect(typeof result.timestamp).toBe('bigint');
      expect(result.timestamp >= BigInt('1000000000000')).toBe(true);
      expect(result.timestamp <= BigInt('9999999999999')).toBe(true);
    });

    test('works with or templates', () => {
      resetMathRandom();
      const result = TemplateJson.gen(['or', 'int', 'int64', 'str']);
      const isBigInt = typeof result === 'bigint';
      const isNumber = typeof result === 'number';
      const isString = typeof result === 'string';
      expect(isBigInt || isNumber || isString).toBe(true);
    });
  });

  describe('num', () => {
    test('generates random number, without range', () => {
      resetMathRandom();
      const num = TemplateJson.gen('num');
      expect(typeof num).toBe('number');
    });

    test('can specify range', () => {
      resetMathRandom();
      const num = TemplateJson.gen(['num', 0, 1]);
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThanOrEqual(1);
    });

    test('handles negative ranges', () => {
      resetMathRandom();
      const num = TemplateJson.gen(['num', -10, -5]);
      expect(num).toBeGreaterThanOrEqual(-10);
      expect(num).toBeLessThanOrEqual(-5);
    });
  });

  describe('float', () => {
    test('uses default float schema, if not provided', () => {
      resetMathRandom();
      const float = TemplateJson.gen('float');
      expect(typeof float).toBe('number');
    });

    test('can specify range', () => {
      resetMathRandom();
      const float = TemplateJson.gen(['float', 0.1, 0.9]);
      expect(float).toBeGreaterThanOrEqual(0.1);
      expect(float).toBeLessThanOrEqual(0.9);
    });

    test('handles very small ranges', () => {
      resetMathRandom();
      const float = TemplateJson.gen(['float', 1.0, 1.1]);
      expect(float).toBeGreaterThanOrEqual(1.0);
      expect(float).toBeLessThanOrEqual(1.1);
    });
  });

  describe('bool', () => {
    test('uses default boolean schema, if not provided', () => {
      resetMathRandom();
      const bool = TemplateJson.gen('bool');
      expect(typeof bool).toBe('boolean');
    });

    test('can specify fixed value', () => {
      expect(TemplateJson.gen(['bool', true])).toBe(true);
      expect(TemplateJson.gen(['bool', false])).toBe(false);
    });

    test('generates random booleans when no value specified', () => {
      resetMathRandom();
      expect(TemplateJson.gen(['bool'])).toBe(true);
      resetMathRandom(999);
      expect(TemplateJson.gen(['bool'])).toBe(true);
    });
  });

  describe('bin', () => {
    test('uses default binary schema, if not provided', () => {
      resetMathRandom();
      const bin = TemplateJson.gen('bin');
      expect(bin instanceof Uint8Array).toBe(true);
      expect((bin as Uint8Array).length).toBeGreaterThanOrEqual(0);
      expect((bin as Uint8Array).length).toBeLessThanOrEqual(5);
    });

    test('can specify length range', () => {
      resetMathRandom();
      const bin = TemplateJson.gen(['bin', 2, 4]) as Uint8Array;
      expect(bin instanceof Uint8Array).toBe(true);
      expect(bin.length).toBeGreaterThanOrEqual(2);
      expect(bin.length).toBeLessThanOrEqual(4);
    });

    test('can specify octet value range', () => {
      resetMathRandom();
      const bin = TemplateJson.gen(['bin', 5, 5, 100, 150]) as Uint8Array;
      expect(bin instanceof Uint8Array).toBe(true);
      expect(bin.length).toBe(5);
      for (let i = 0; i < bin.length; i++) {
        expect(bin[i]).toBeGreaterThanOrEqual(100);
        expect(bin[i]).toBeLessThanOrEqual(150);
      }
    });

    test('handles edge cases', () => {
      // Empty array
      const empty = TemplateJson.gen(['bin', 0, 0]) as Uint8Array;
      expect(empty instanceof Uint8Array).toBe(true);
      expect(empty.length).toBe(0);

      // Single byte with fixed value range
      resetMathRandom();
      const single = TemplateJson.gen(['bin', 1, 1, 42, 42]) as Uint8Array;
      expect(single instanceof Uint8Array).toBe(true);
      expect(single.length).toBe(1);
      expect(single[0]).toBe(42);
    });

    test('uses default octet range when not specified', () => {
      resetMathRandom();
      const bin = TemplateJson.gen(['bin', 3, 3]) as Uint8Array;
      expect(bin instanceof Uint8Array).toBe(true);
      expect(bin.length).toBe(3);
      for (let i = 0; i < bin.length; i++) {
        expect(bin[i]).toBeGreaterThanOrEqual(0);
        expect(bin[i]).toBeLessThanOrEqual(255);
      }
    });

    test('respects maxNodes limit', () => {
      const bin = TemplateJson.gen(['bin', 10, 20], {maxNodes: 5}) as Uint8Array;
      expect(bin instanceof Uint8Array).toBe(true);
      expect(bin.length).toBeLessThanOrEqual(10);
    });
  });

  describe('nil', () => {
    test('always returns null', () => {
      expect(TemplateJson.gen('nil')).toBe(null);
      expect(TemplateJson.gen(['nil'])).toBe(null);
    });
  });

  describe('lit', () => {
    test('returns literal values', () => {
      expect(TemplateJson.gen(['lit', 42])).toBe(42);
      expect(TemplateJson.gen(['lit', 'hello'])).toBe('hello');
      expect(TemplateJson.gen(['lit', true])).toBe(true);
      expect(TemplateJson.gen(['lit', null])).toBe(null);
    });

    test('deep clones objects', () => {
      const obj = {a: 1, b: {c: 2}};
      const result = TemplateJson.gen(['lit', obj]);
      expect(result).toEqual(obj);
      expect(result).not.toBe(obj);
      expect((result as any).b).not.toBe(obj.b);
    });

    test('deep clones arrays', () => {
      const arr = [1, [2, 3], {a: 4}];
      const result = TemplateJson.gen(['lit', arr]);
      expect(result).toEqual(arr);
      expect(result).not.toBe(arr);
      expect((result as any)[1]).not.toBe(arr[1]);
      expect((result as any)[2]).not.toBe(arr[2]);
    });
  });

  describe('arr', () => {
    test('uses default array schema, if not provided', () => {
      resetMathRandom();
      const arr = TemplateJson.gen('arr');
      expect(Array.isArray(arr)).toBe(true);
      expect((arr as any[]).length).toBeGreaterThanOrEqual(0);
      expect((arr as any[]).length).toBeLessThanOrEqual(5);
    });

    test('can specify length range', () => {
      resetMathRandom();
      const arr = TemplateJson.gen(['arr', 2, 4]);
      expect(Array.isArray(arr)).toBe(true);
      expect((arr as any[]).length).toBeGreaterThanOrEqual(2);
      expect((arr as any[]).length).toBeLessThanOrEqual(4);
    });

    test('can specify item template', () => {
      resetMathRandom();
      const arr = TemplateJson.gen(['arr', 2, 2, 'str']);
      expect(Array.isArray(arr)).toBe(true);
      expect((arr as any[]).length).toBe(2);
      expect(typeof (arr as any[])[0]).toBe('string');
      expect(typeof (arr as any[])[1]).toBe('string');
    });

    test('can specify head templates', () => {
      resetMathRandom();
      const arr = TemplateJson.gen([
        'arr',
        1,
        1,
        'nil',
        [
          ['lit', 'first'],
          ['lit', 'second'],
        ],
      ]);
      expect(Array.isArray(arr)).toBe(true);
      expect((arr as any[])[0]).toBe('first');
      expect((arr as any[])[1]).toBe('second');
    });

    test('can specify tail templates', () => {
      resetMathRandom();
      const arr = TemplateJson.gen([
        'arr',
        1,
        1,
        'nil',
        [],
        [
          ['lit', 'tail1'],
          ['lit', 'tail2'],
        ],
      ]);
      expect(Array.isArray(arr)).toBe(true);
      const arrTyped = arr as any[];
      expect(arrTyped[arrTyped.length - 2]).toBe('tail1');
      expect(arrTyped[arrTyped.length - 1]).toBe('tail2');
    });

    test('handles empty arrays', () => {
      const arr = TemplateJson.gen(['arr', 0, 0]);
      expect(Array.isArray(arr)).toBe(true);
      expect((arr as any[]).length).toBe(0);
    });
  });

  describe('obj', () => {
    test('uses default object schema, if not provided', () => {
      const obj = TemplateJson.gen('obj');
      expect(typeof obj).toBe('object');
      expect(obj).not.toBe(null);
    });

    test('can specify fields', () => {
      resetMathRandom();
      const obj = TemplateJson.gen([
        'obj',
        [
          ['name', 'str'],
          ['age', 'int'],
        ],
      ]);
      expect(typeof obj).toBe('object');
      expect(typeof (obj as any).name).toBe('string');
      expect(typeof (obj as any).age).toBe('number');
    });

    test('handles optional fields', () => {
      resetMathRandom();
      const obj = TemplateJson.gen([
        'obj',
        [
          ['required', 'str', 0],
          ['optional', 'str', 1],
        ],
      ]);
      expect(typeof (obj as any).required).toBe('string');
      expect((obj as any).optional).toBeUndefined();
    });

    test('can use token for key generation', () => {
      resetMathRandom();
      const obj = TemplateJson.gen(['obj', [[['pick', 'key1', 'key2'], 'str']]]);
      expect(typeof obj).toBe('object');
      const keys = Object.keys(obj as any);
      expect(keys.length).toBe(1);
      expect(['key1', 'key2']).toContain(keys[0]);
    });

    test('handles null key token', () => {
      resetMathRandom();
      const obj = TemplateJson.gen(['obj', [[null, 'str']]]);
      expect(typeof obj).toBe('object');
      const keys = Object.keys(obj as any);
      expect(keys.length).toBe(1);
    });
  });

  describe('map', () => {
    test('uses default map schema when using shorthand', () => {
      const map = TemplateJson.gen('map');
      expect(typeof map).toBe('object');
      expect(map).not.toBe(null);
      expect(Array.isArray(map)).toBe(false);
    });

    test('generates map with default parameters', () => {
      resetMathRandom();
      const map = TemplateJson.gen(['map', null]) as Record<string, unknown>;
      expect(typeof map).toBe('object');
      expect(map).not.toBe(null);
      const keys = Object.keys(map);
      expect(keys.length).toBeGreaterThanOrEqual(0);
      expect(keys.length).toBeLessThanOrEqual(5);
    });

    test('generates map with custom key token', () => {
      resetMathRandom();
      const map = TemplateJson.gen(['map', ['pick', 'key1', 'key2', 'key3'], 'str']) as Record<string, unknown>;
      expect(typeof map).toBe('object');
      const keys = Object.keys(map);
      for (const key of keys) {
        expect(['key1', 'key2', 'key3']).toContain(key);
        expect(typeof map[key]).toBe('string');
      }
    });

    test('generates map with custom value template', () => {
      resetMathRandom();
      const map = TemplateJson.gen(['map', null, 'int']) as Record<string, unknown>;
      expect(typeof map).toBe('object');
      const values = Object.values(map);
      for (const value of values) {
        expect(typeof value).toBe('number');
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    test('respects min and max constraints', () => {
      resetMathRandom();
      const map1 = TemplateJson.gen(['map', null, 'str', 2, 2]) as Record<string, unknown>;
      expect(Object.keys(map1).length).toBe(2);

      resetMathRandom();
      const map2 = TemplateJson.gen(['map', null, 'str', 0, 1]) as Record<string, unknown>;
      const keys = Object.keys(map2);
      expect(keys.length).toBeGreaterThanOrEqual(0);
      expect(keys.length).toBeLessThanOrEqual(1);
    });

    test('handles complex nested templates', () => {
      const map = deterministic(12345789, () =>
        TemplateJson.gen([
          'map',
          ['list', 'user_', ['pick', '1', '2', '3']],
          [
            'obj',
            [
              ['name', 'str'],
              ['age', 'int'],
            ],
          ],
        ]),
      ) as Record<string, unknown>;
      expect(typeof map).toBe('object');
      const keys = Object.keys(map);
      for (const key of keys) {
        expect(key).toMatch(/^user_[123]$/);
        const value = map[key];
        expect(typeof value).toBe('object');
        expect(value).not.toBe(null);
        expect(typeof (value as any).name).toBe('string');
        expect(typeof (value as any).age).toBe('number');
      }
    });

    test('handles empty map when min is 0', () => {
      const map = TemplateJson.gen(['map', null, 'str', 0, 0]) as Record<string, unknown>;
      expect(typeof map).toBe('object');
      expect(Object.keys(map).length).toBe(0);
    });

    test('respects maxNodes limit', () => {
      const map = TemplateJson.gen(['map', null, 'str', 10, 20], {maxNodes: 5}) as Record<string, unknown>;
      expect(typeof map).toBe('object');
      const keys = Object.keys(map);
      expect(keys.length).toBeLessThanOrEqual(10);
    });
  });

  describe('or', () => {
    test('picks one of the provided templates', () => {
      resetMathRandom();
      const result = TemplateJson.gen(['or', 'str', 'int', 'bool']);
      expect(['string', 'number', 'boolean']).toContain(typeof result);
    });

    test('works with complex templates', () => {
      resetMathRandom();
      const result = TemplateJson.gen(['or', ['lit', 'hello'], ['lit', 42], ['lit', true]]);
      expect(['hello', 42, true]).toContain(result);
    });

    test('handles single option', () => {
      const result = TemplateJson.gen(['or', ['lit', 'only']]);
      expect(result).toBe('only');
    });

    test('works with bin templates', () => {
      resetMathRandom();
      const result = TemplateJson.gen(['or', 'str', 'int', ['bin', 2, 2]]);
      // Result should be one of the template types
      const isString = typeof result === 'string';
      const isNumber = typeof result === 'number';
      const isBin = result instanceof Uint8Array;
      expect(isString || isNumber || isBin).toBe(true);
    });
  });

  describe('maxNodeCount', () => {
    test('respects node count limit', () => {
      const result = TemplateJson.gen(['arr', 1, 100, 'str'], {maxNodes: 5}) as any[];
      expect(Array.isArray(result)).toBe(true);
      expect(result.length > 2).toBe(true);
      expect(result.length < 10).toBe(true);
    });

    test('works with nested structures', () => {
      const template: any = ['arr', 3, 3, ['obj', [['key', 'str']]]];
      const result = TemplateJson.gen(template, {maxNodes: 10});
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('handles deeply nested structures', () => {
      const template: any = [
        'obj',
        [
          [
            'users',
            [
              'arr',
              2,
              2,
              [
                'obj',
                [
                  ['name', 'str'],
                  [
                    'profile',
                    [
                      'obj',
                      [
                        ['age', 'int'],
                        ['active', 'bool'],
                      ],
                    ],
                  ],
                ],
              ],
            ],
          ],
        ],
      ];

      resetMathRandom();
      const result = TemplateJson.gen(template);
      expect(typeof result).toBe('object');
      expect(Array.isArray((result as any).users)).toBe(true);
      expect((result as any).users.length).toBe(2);
    });

    test('handles recursive or templates', () => {
      resetMathRandom();
      const result = TemplateJson.gen(['or', ['or', 'str', 'int'], 'bool']);
      expect(['string', 'number', 'boolean']).toContain(typeof result);
    });

    test('handles empty object fields', () => {
      const result = TemplateJson.gen(['obj', []]);
      expect(typeof result).toBe('object');
      expect(Object.keys(result as any).length).toBe(0);
    });

    test('handles very large integer ranges', () => {
      resetMathRandom();
      const result = TemplateJson.gen(['int', Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]);
      expect(typeof result).toBe('number');
      expect(Number.isInteger(result)).toBe(true);
    });

    test('handles bin templates in complex structures', () => {
      resetMathRandom();
      const template: any = [
        'obj',
        [
          ['name', 'str'],
          ['data', ['bin', 3, 3]],
          [
            'metadata',
            [
              'obj',
              [
                ['hash', ['bin', 32, 32]],
                ['signature', ['bin', 64, 64, 0, 127]],
              ],
            ],
          ],
        ],
      ];
      const result = TemplateJson.gen(template) as any;
      expect(typeof result).toBe('object');
      expect(typeof result.name).toBe('string');
      expect(result.data instanceof Uint8Array).toBe(true);
      expect(result.data.length).toBe(3);
      expect(typeof result.metadata).toBe('object');
      expect(result.metadata.hash instanceof Uint8Array).toBe(true);
      expect(result.metadata.hash.length).toBe(32);
      expect(result.metadata.signature instanceof Uint8Array).toBe(true);
      expect(result.metadata.signature.length).toBe(64);
      // Check signature values are in the specified range
      for (let i = 0; i < result.metadata.signature.length; i++) {
        expect(result.metadata.signature[i]).toBeGreaterThanOrEqual(0);
        expect(result.metadata.signature[i]).toBeLessThanOrEqual(127);
      }
    });
  });
});

describe('recursive templates', () => {
  test('handles recursive structures', () => {
    const user = (): Template => [
      'obj',
      [
        ['id', ['str', ['repeat', 4, 8, ['pick', ...'0123456789'.split('')]]]],
        ['friend', user, 0.2],
      ],
    ];
    const result = deterministic(123, () => TemplateJson.gen(user));
    expect(result).toEqual({
      id: '4960',
      friend: {
        id: '93409',
        friend: {
          id: '898338',
          friend: {
            id: '638225',
            friend: {
              id: '1093',
              friend: {
                id: '7985',
                friend: {
                  id: '7950',
                  friend: {
                    id: '593382',
                    friend: {
                      id: '9670919',
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  });

  test('can limit number of nodes', () => {
    const user = (): Template => [
      'obj',
      [
        ['id', ['str', ['repeat', 4, 8, ['pick', ...'0123456789'.split('')]]]],
        ['friend', user, 0.2],
      ],
    ];
    const result = deterministic(123, () => TemplateJson.gen(user, {maxNodes: 5}));
    expect(result).toEqual({
      id: '4960',
      friend: {
        id: '93409',
        friend: {
          id: '898338',
        },
      },
    });
  });
});
