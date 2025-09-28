/**
 * JSONPath parser tests based on RFC 9535
 */

import {JsonPathParser} from '../index';
import type {NamedSelector, IndexSelector, SliceSelector, ParseResult} from '../types';

describe('JsonPathParser', () => {
  describe('Basic parsing', () => {
    test('should parse root selector', () => {
      const result = JsonPathParser.parse('$');
      expect(result).toMatchObject<ParseResult>({
        success: true,
        path: {
          segments: [],
        }
      });
    });

    test('should parse dot notation', () => {
      const result = JsonPathParser.parse('$.name');
      expect(result).toMatchObject<ParseResult>({
        success: true,
        path: {
          segments: [
            {
              selectors: [
                {
                  type: 'name',
                  name: 'name'
                }
              ]
            }
          ]
        }
      });
    });

    test('should parse bracket notation with string', () => {
      const result = JsonPathParser.parse("$['name']");
      expect(result).toMatchObject<ParseResult>({
        success: true,
        path: {
          segments: [
            {
              selectors: [
                {
                  type: 'name',
                  name: 'name'
                }
              ]
            }
          ]
        }
      });
    });

    test('should parse bracket notation with double quotes', () => {
      const result = JsonPathParser.parse('$["name"]');
      expect(result).toMatchObject<ParseResult>({
        success: true,
        path: {
          segments: [
            {
              selectors: [
                {
                  type: 'name',
                  name: 'name'
                }
              ]
            }
          ]
        }
      });
    });

    test('should parse array index', () => {
      const result = JsonPathParser.parse('$[0]');
      expect(result).toMatchObject<ParseResult>({
        success: true,
        path: {
          segments: [
            {
              selectors: [
                {
                  type: 'index',
                  index: 0
                }
              ]
            }
          ]
        }
      });
    });

    test('should parse negative array index', () => {
      const result = JsonPathParser.parse('$[-1]');
      expect(result).toMatchObject<ParseResult>({
        success: true,
        path: {
          segments: [
            {
              selectors: [
                {
                  type: 'index',
                  index: -1
                }
              ]
            }
          ]
        }
      });
    });

    test('should parse wildcard selector', () => {
      const result = JsonPathParser.parse('$.*');
      expect(result).toMatchObject<ParseResult>({
        success: true,
        path: {
          segments: [
            {
              selectors: [
                {
                  type: 'wildcard'
                }
              ]
            }
          ]
        }
      });
    });

    test('should parse bracket wildcard selector', () => {
      const result = JsonPathParser.parse('$[*]');
      expect(result).toMatchObject<ParseResult>({
        success: true,
        path: {
          segments: [
            {
              selectors: [
                {
                  type: 'wildcard'
                }
              ]
            }
          ]
        }
      });
    });
  });

  describe('Array slicing', () => {
    test('should parse slice with start and end', () => {
      const result = JsonPathParser.parse('$[1:3]');
      expect(result).toMatchObject<ParseResult>({
        success: true,
        path: {
          segments: [
            {
              selectors: [
                {
                  type: 'slice',
                  start: 1,
                  end: 3
                }
              ]
            }
          ]
        }
      });
    });

    test('should parse slice with start, end, and step', () => {
      const result = JsonPathParser.parse('$[1:10:2]');
      expect(result).toMatchObject<ParseResult>({
        success: true,
        path: {
          segments: [
            {
              selectors: [
                {
                  type: 'slice',
                  start: 1,
                  end: 10,
                  step: 2
                }
              ]
            }
          ]
        }
      });
    });

    test('should parse slice with only step step', () => {
      const result = JsonPathParser.parse('$[::4]');
      expect(result).toMatchObject<ParseResult>({
        success: true,
        path: {
          segments: [
            {
              selectors: [
                {
                  type: 'slice',
                  step: 4
                }
              ]
            }
          ]
        }
      });
    });

    test('should parse slice with only start', () => {
      const result = JsonPathParser.parse('$[2:]');
      expect(result).toMatchObject<ParseResult>({
        success: true,
        path: {
          segments: [
            {
              selectors: [
                {
                  type: 'slice',
                  start: 2
                }
              ]
            }
          ]
        }
      });
    });

    test('should parse slice with only end', () => {
      const result = JsonPathParser.parse('$[:3]');
      expect(result).toMatchObject<ParseResult>({
        success: true,
        path: {
          segments: [
            {
              selectors: [
                {
                  type: 'slice',
                  end: 3
                }
              ]
            }
          ]
        }
      });
    });
  });

  describe('Complex paths', () => {
    test('should parse multi-segment path', () => {
      const result = JsonPathParser.parse('$.store.book[0].title');
      expect(result).toMatchObject<ParseResult>({
        success: true,
        path: {
          segments: [
            {
              selectors: [
                {
                  type: 'name',
                  name: 'store'
                }
              ]
            },
            {
              selectors: [
                {
                  type: 'name',
                  name: 'book'
                }
              ]
            },
            {
              selectors: [
                {
                  type: 'index',
                  index: 0
                }
              ]
            },
            {
              selectors: [
                {
                  type: 'name',
                  name: 'title'
                }
              ]
            }
          ]
        }
      });
    });

    test('should parse path with mixed notation', () => {
      const result = JsonPathParser.parse("$.store['book'][0]['title']");
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(4);

      // Check all selectors are NamedSelector or IndexSelector
      const selectors = result.path?.segments.map((seg) => seg.selectors[0]);
      expect(selectors?.[0]).toMatchObject({type: 'name', name: 'store'});
      expect(selectors?.[1]).toMatchObject({type: 'name', name: 'book'});
      expect(selectors?.[2]).toMatchObject({type: 'index', index: 0});
      expect(selectors?.[3]).toMatchObject({type: 'name', name: 'title'});
    });
  });

  describe('Filter expressions', () => {
    test('should parse simple comparison filter', () => {
      const result = JsonPathParser.parse('$[?(@.price < 10)]');
      expect(result).toMatchObject<ParseResult>({
        success: true,
        path: {
          segments: [
            {
              selectors: [
                {
                  type: 'filter',
                  expression: {
                    type: 'comparison',
                    operator: '<',
                    left: {
                      type: 'path',
                      path: {
                        segments: [
                          {
                            selectors: [
                              {
                                type: 'name',
                                name: 'price'
                              }
                            ]
                          }
                        ]
                      }
                    },
                    right: {
                      type: 'literal',
                      value: 10
                    }
                  }
                }
              ]
            }
          ]
        }
      });
    });

    test('should parse filter with equality', () => {
      const result = JsonPathParser.parse("$[?(@.author == 'Tolkien')]");
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0]?.selectors[0];
      expect(selector?.type).toBe('filter');
      expect((selector as any)?.expression.type).toBe('comparison');
      expect((selector as any)?.expression.operator).toBe('==');
    });

    test('should parse filter with all comparison operators', () => {
      const tests = [
        { expr: '$[?(@.price == 10)]', op: '==' },
        { expr: '$[?(@.price != 10)]', op: '!=' },
        { expr: '$[?(@.price < 10)]', op: '<' },
        { expr: '$[?(@.price <= 10)]', op: '<=' },
        { expr: '$[?(@.price > 10)]', op: '>' },
        { expr: '$[?(@.price >= 10)]', op: '>=' },
      ];

      tests.forEach(({expr, op}) => {
        const result = JsonPathParser.parse(expr);
        expect(result.success).toBe(true);
        const selector = result.path?.segments[0]?.selectors[0];
        expect(selector?.type).toBe('filter');
        expect((selector as any)?.expression.type).toBe('comparison');
        expect((selector as any)?.expression.operator).toBe(op);
      });
    });

    test('should parse filter with logical AND', () => {
      const result = JsonPathParser.parse('$[?(@.price < 10 && @.author == "Tolkien")]');
      expect(result.success).toBe(true);
      
      const selector = result.path?.segments[0]?.selectors[0];
      expect(selector?.type).toBe('filter');
      expect((selector as any)?.expression.type).toBe('logical');
      expect((selector as any)?.expression.operator).toBe('&&');
    });

    test('should parse filter with logical OR', () => {
      const result = JsonPathParser.parse('$[?(@.price < 10 || @.price > 100)]');
      expect(result.success).toBe(true);
      
      const selector = result.path?.segments[0]?.selectors[0];
      expect(selector?.type).toBe('filter');
      expect((selector as any)?.expression.type).toBe('logical');
      expect((selector as any)?.expression.operator).toBe('||');
    });

    test('should parse filter with negation', () => {
      const result = JsonPathParser.parse('$[?(!@.isbn)]');
      expect(result.success).toBe(true);
      
      const selector = result.path?.segments[0]?.selectors[0];
      expect(selector?.type).toBe('filter');
      expect((selector as any)?.expression.type).toBe('negation');
    });

    test('should parse filter with parentheses', () => {
      const result = JsonPathParser.parse('$[?((@.price < 10) && (@.category == "fiction"))]');
      expect(result.success).toBe(true);
      
      const selector = result.path?.segments[0]?.selectors[0];
      expect(selector?.type).toBe('filter');
      expect((selector as any)?.expression.type).toBe('logical');
    });

    test('should parse existence test filter', () => {
      const result = JsonPathParser.parse('$[?(@.isbn)]');
      expect(result.success).toBe(true);
      
      const selector = result.path?.segments[0]?.selectors[0];
      expect(selector?.type).toBe('filter');
      expect((selector as any)?.expression.type).toBe('existence');
    });

    test('should parse filter with different literal types', () => {
      const tests = [
        { expr: '$[?(@.name == "test")]', value: 'test' },
        { expr: "$[?(@.name == 'test')]", value: 'test' },
        { expr: '$[?(@.price == 42)]', value: 42 },
        { expr: '$[?(@.price == 3.14)]', value: 3.14 },
        { expr: '$[?(@.active == true)]', value: true },
        { expr: '$[?(@.active == false)]', value: false },
        { expr: '$[?(@.value == null)]', value: null },
      ];

      tests.forEach(({expr, value}) => {
        const result = JsonPathParser.parse(expr);
        expect(result.success).toBe(true);
        const selector = result.path?.segments[0]?.selectors[0];
        expect((selector as any)?.expression.right.value).toEqual(value);
      });
    });

    test('should parse filter with complex path expressions', () => {
      const result = JsonPathParser.parse('$[?(@.book[0].author == "Tolkien")]');
      expect(result.success).toBe(true);
      
      const selector = result.path?.segments[0]?.selectors[0];
      expect(selector?.type).toBe('filter');
      expect((selector as any)?.expression.type).toBe('comparison');
      
      const leftPath = (selector as any)?.expression.left.path;
      expect(leftPath.segments).toHaveLength(3);
      expect(leftPath.segments[0].selectors[0]).toMatchObject({type: 'name', name: 'book'});
      expect(leftPath.segments[1].selectors[0]).toMatchObject({type: 'index', index: 0});
      expect(leftPath.segments[2].selectors[0]).toMatchObject({type: 'name', name: 'author'});
    });

    test('should parse filter with function expressions', () => {
      const tests = [
        '$[?length(@.name) > 5]',
        '$[?count(@.items) == 3]',
        '$[?match(@.email, ".*@example\\.com")]',
        '$[?search(@.description, "test")]',
      ];

      tests.forEach(expr => {
        const result = JsonPathParser.parse(expr);
        expect(result.success).toBe(true);
        const selector = result.path?.segments[0]?.selectors[0];
        expect(selector?.type).toBe('filter');
      });
    });

    test('should parse complex nested filter expressions', () => {
      const result = JsonPathParser.parse('$[?((@.price < 10 || @.price > 100) && @.category == "book")]');
      expect(result).toMatchObject({
        success: true,
        path: {
          segments: [
            {
              selectors: [
                {
                  type: 'filter',
                  expression: {
                    type: 'logical',
                    operator: '&&',
                    left: {
                      type: 'paren',
                      expression: {
                        type: 'logical',
                        operator: '||',
                        left: {
                          type: 'comparison',
                          operator: '<',
                          left: {
                            type: 'path',
                            path: {
                              segments: [
                                {
                                  selectors: [
                                    {
                                      type: 'name',
                                      name: 'price',
                                    },
                                  ],
                                },
                              ],
                            }
                          },
                          right: {
                            type: 'literal',
                            value: 10,
                          },
                        },
                        right: {
                          type: 'comparison',
                          operator: '>',
                          left: {
                            type: 'path',
                            path: {
                              segments: [
                                {
                                  selectors: [
                                    {
                                      type: 'name',
                                      name: 'price',
                                    },
                                  ],
                                },
                              ],
                            },
                          },
                          right: {
                            type: 'literal',
                            value: 100,
                          },
                        },
                      },
                    },
                    right: {
                      type: 'comparison',
                      operator: '==',
                      left: {
                        type: 'path',
                        path: {
                          segments: [
                            {
                              selectors: [
                                {
                                  type: 'name',
                                  name: 'category',
                                },
                              ],
                            },
                          ],
                        },
                      },
                      right: {
                        type: 'literal',
                        value: 'book',
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
      });
    });
  });
      
  describe('RFC 9535 examples', () => {
    test('should parse "$.store.book[*].author"', () => {
      const result = JsonPathParser.parse('$.store.book[*].author');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(4);

      const selectors = result.path?.segments.map((seg) => seg.selectors[0]);
      expect(selectors?.[0]).toMatchObject({type: 'name', name: 'store'});
      expect(selectors?.[1]).toMatchObject({type: 'name', name: 'book'});
      expect(selectors?.[2]).toMatchObject({type: 'wildcard'});
      expect(selectors?.[3]).toMatchObject({type: 'name', name: 'author'});
    });

    test('should parse "$..author"', () => {
      const result = JsonPathParser.parse('$..author');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0]?.selectors[0];
      expect(selector?.type).toBe('recursive-descent');
      expect((selector as any).selector).toMatchObject({type: 'name', name: 'author'});
    });

    test('should parse "$.store.*"', () => {
      const result = JsonPathParser.parse('$.store.*');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(2);

      const selectors = result.path?.segments.map((seg) => seg.selectors[0]);
      expect(selectors?.[0]).toMatchObject({type: 'name', name: 'store'});
      expect(selectors?.[1]).toMatchObject({type: 'wildcard'});
    });

    test('should parse "$.store.book[0,1]" (union selector)', () => {
      const result = JsonPathParser.parse('$.store.book[0,1]');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(3);

      // Check the third segment (book[0,1]) has two selectors
      const bookSegment = result.path?.segments[2];
      expect(bookSegment?.selectors).toHaveLength(2);
      expect(bookSegment?.selectors[0]).toMatchObject({type: 'index', index: 0});
      expect(bookSegment?.selectors[1]).toMatchObject({type: 'index', index: 1});
    });

    test('should parse union selector with string keys', () => {
      const result = JsonPathParser.parse("$['a','b','c']");
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const segment = result.path?.segments[0];
      expect(segment?.selectors).toHaveLength(3);
      expect(segment?.selectors[0]).toMatchObject({type: 'name', name: 'a'});
      expect(segment?.selectors[1]).toMatchObject({type: 'name', name: 'b'});
      expect(segment?.selectors[2]).toMatchObject({type: 'name', name: 'c'});
    });

    test('should parse mixed union selector (numbers and strings)', () => {
      const result = JsonPathParser.parse("$[0, 'name', 2]");
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const segment = result.path?.segments[0];
      expect(segment?.selectors).toHaveLength(3);
      expect(segment?.selectors[0]).toMatchObject({type: 'index', index: 0});
      expect(segment?.selectors[1]).toMatchObject({type: 'name', name: 'name'});
      expect(segment?.selectors[2]).toMatchObject({type: 'index', index: 2});
    });

    test('should parse union selector with wildcard', () => {
      const result = JsonPathParser.parse("$[*, 0, 'key']");
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const segment = result.path?.segments[0];
      expect(segment?.selectors).toHaveLength(3);
      expect(segment?.selectors[0]).toMatchObject({type: 'wildcard'});
      expect(segment?.selectors[1]).toMatchObject({type: 'index', index: 0});
      expect(segment?.selectors[2]).toMatchObject({type: 'name', name: 'key'});
    });

    test('should parse union selector with slices', () => {
      const result = JsonPathParser.parse("$[0:2, 5, 'key']");
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const segment = result.path?.segments[0];
      expect(segment?.selectors).toHaveLength(3);
      expect(segment?.selectors[0]).toMatchObject({type: 'slice', start: 0, end: 2, step: undefined});
      expect(segment?.selectors[1]).toMatchObject({type: 'index', index: 5});
      expect(segment?.selectors[2]).toMatchObject({type: 'name', name: 'key'});
    });

    test('should handle whitespace in union selectors', () => {
      const result = JsonPathParser.parse("$[ 0 , 'name' , 2 ]");
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const segment = result.path?.segments[0];
      expect(segment?.selectors).toHaveLength(3);
      expect(segment?.selectors[0]).toMatchObject({type: 'index', index: 0});
      expect(segment?.selectors[1]).toMatchObject({type: 'name', name: 'name'});
      expect(segment?.selectors[2]).toMatchObject({type: 'index', index: 2});
    });

    test('should parse union selector with negative indices', () => {
      const result = JsonPathParser.parse("$[-1, -2, 0]");
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const segment = result.path?.segments[0];
      expect(segment?.selectors).toHaveLength(3);
      expect(segment?.selectors[0]).toMatchObject({type: 'index', index: -1});
      expect(segment?.selectors[1]).toMatchObject({type: 'index', index: -2});
      expect(segment?.selectors[2]).toMatchObject({type: 'index', index: 0});
    });

    test('should parse complex nested union selectors', () => {
      const result = JsonPathParser.parse("$.store['book', 'bicycle'][0, -1, 'title']");
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(3);

      // First segment: .store
      const storeSegment = result.path?.segments[0];
      expect(storeSegment?.selectors).toHaveLength(1);
      expect(storeSegment?.selectors[0]).toMatchObject({type: 'name', name: 'store'});

      // Second segment: ['book', 'bicycle']
      const categorySegment = result.path?.segments[1];
      expect(categorySegment?.selectors).toHaveLength(2);
      expect(categorySegment?.selectors[0]).toMatchObject({type: 'name', name: 'book'});
      expect(categorySegment?.selectors[1]).toMatchObject({type: 'name', name: 'bicycle'});

      // Third segment: [0, -1, 'title']
      const itemSegment = result.path?.segments[2];
      expect(itemSegment?.selectors).toHaveLength(3);
      expect(itemSegment?.selectors[0]).toMatchObject({type: 'index', index: 0});
      expect(itemSegment?.selectors[1]).toMatchObject({type: 'index', index: -1});
      expect(itemSegment?.selectors[2]).toMatchObject({type: 'name', name: 'title'});
    });

    test('should handle empty union selector (single element)', () => {
      const result = JsonPathParser.parse("$[0]");
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const segment = result.path?.segments[0];
      expect(segment?.selectors).toHaveLength(1);
      expect(segment?.selectors[0]).toMatchObject({type: 'index', index: 0});
    });

    test('should handle union selector with double quotes', () => {
      const result = JsonPathParser.parse('$["first", "second", 0]');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const segment = result.path?.segments[0];
      expect(segment?.selectors).toHaveLength(3);
      expect(segment?.selectors[0]).toMatchObject({type: 'name', name: 'first'});
      expect(segment?.selectors[1]).toMatchObject({type: 'name', name: 'second'});
      expect(segment?.selectors[2]).toMatchObject({type: 'index', index: 0});
    });

    test('should parse "$.store.book[-1]"', () => {
      const result = JsonPathParser.parse('$.store.book[-1]');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(3);

      const selector = result.path?.segments[2].selectors[0] as IndexSelector;
      expect(selector.type).toBe('index');
      expect(selector.index).toBe(-1);
    });

    test('should parse "$.store.book[0:2]"', () => {
      const result = JsonPathParser.parse('$.store.book[0:2]');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(3);

      const selector = result.path?.segments[2].selectors[0] as SliceSelector;
      expect(selector.type).toBe('slice');
      expect(selector.start).toBe(0);
      expect(selector.end).toBe(2);
    });
  });

  describe('Error handling', () => {
    test('should fail on invalid JSONPath without $', () => {
      const result = JsonPathParser.parse('.name');
      expect(result.success).toBe(false);
      expect(result.error).toContain('JSONPath must start with $');
    });

    test('should fail on unterminated string', () => {
      const result = JsonPathParser.parse("$['unterminated");
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unterminated string literal');
    });

    test('should fail on invalid bracket notation', () => {
      const result = JsonPathParser.parse('$[invalid]');
      expect(result.success).toBe(false);
    });

    test('should fail on unclosed bracket', () => {
      const result = JsonPathParser.parse('$[0');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Expected ] to close bracket selector');
    });
  });

  describe('Edge cases', () => {
    test('should handle empty string keys', () => {
      const result = JsonPathParser.parse("$['']");
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0].selectors[0] as NamedSelector;
      expect(selector.type).toBe('name');
      expect(selector.name).toBe('');
    });

    test('should handle keys with special characters', () => {
      const result = JsonPathParser.parse("$['key with spaces']");
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0].selectors[0] as NamedSelector;
      expect(selector.type).toBe('name');
      expect(selector.name).toBe('key with spaces');
    });

    test('should handle escaped characters in strings', () => {
      const result = JsonPathParser.parse("$['key\\'with\\'quotes']");
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0].selectors[0] as NamedSelector;
      expect(selector.type).toBe('name');
      expect(selector.name).toBe("key'with'quotes");
    });

    test('should handle zero index', () => {
      const result = JsonPathParser.parse('$[0]');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0].selectors[0] as IndexSelector;
      expect(selector.type).toBe('index');
      expect(selector.index).toBe(0);
    });

    test('should handle whitespace', () => {
      const result = JsonPathParser.parse('$ . name [ 0 ] ');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(2);
    });
  });
});
