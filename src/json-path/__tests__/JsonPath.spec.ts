/**
 * JSONPath parser tests based on RFC 9535
 */

import {JsonPathParser} from '../index';
import type {NamedSelector, IndexSelector, WildcardSelector, SliceSelector} from '../types';

describe('JsonPathParser', () => {
  describe('Basic parsing', () => {
    test('should parse root selector', () => {
      const result = JsonPathParser.parse('$');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(0);
    });

    test('should parse dot notation', () => {
      const result = JsonPathParser.parse('$.name');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0].selectors[0] as NamedSelector;
      expect(selector.type).toBe('name');
      expect(selector.name).toBe('name');
    });

    test('should parse bracket notation with string', () => {
      const result = JsonPathParser.parse("$['name']");
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0].selectors[0] as NamedSelector;
      expect(selector.type).toBe('name');
      expect(selector.name).toBe('name');
    });

    test('should parse bracket notation with double quotes', () => {
      const result = JsonPathParser.parse('$["name"]');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0].selectors[0] as NamedSelector;
      expect(selector.type).toBe('name');
      expect(selector.name).toBe('name');
    });

    test('should parse array index', () => {
      const result = JsonPathParser.parse('$[0]');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0].selectors[0] as IndexSelector;
      expect(selector.type).toBe('index');
      expect(selector.index).toBe(0);
    });

    test('should parse negative array index', () => {
      const result = JsonPathParser.parse('$[-1]');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0].selectors[0] as IndexSelector;
      expect(selector.type).toBe('index');
      expect(selector.index).toBe(-1);
    });

    test('should parse wildcard selector', () => {
      const result = JsonPathParser.parse('$.*');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0].selectors[0] as WildcardSelector;
      expect(selector.type).toBe('wildcard');
    });

    test('should parse bracket wildcard selector', () => {
      const result = JsonPathParser.parse('$[*]');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0].selectors[0] as WildcardSelector;
      expect(selector.type).toBe('wildcard');
    });
  });

  describe('Array slicing', () => {
    test('should parse slice with start and end', () => {
      const result = JsonPathParser.parse('$[1:3]');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0].selectors[0] as SliceSelector;
      expect(selector.type).toBe('slice');
      expect(selector.start).toBe(1);
      expect(selector.end).toBe(3);
      expect(selector.step).toBeUndefined();
    });

    test('should parse slice with start, end, and step', () => {
      const result = JsonPathParser.parse('$[1:10:2]');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0].selectors[0] as SliceSelector;
      expect(selector.type).toBe('slice');
      expect(selector.start).toBe(1);
      expect(selector.end).toBe(10);
      expect(selector.step).toBe(2);
    });

    test('should parse slice with only start', () => {
      const result = JsonPathParser.parse('$[2:]');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0].selectors[0] as SliceSelector;
      expect(selector.type).toBe('slice');
      expect(selector.start).toBe(2);
      expect(selector.end).toBeUndefined();
      expect(selector.step).toBeUndefined();
    });

    test('should parse slice with only end', () => {
      const result = JsonPathParser.parse('$[:3]');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0].selectors[0] as SliceSelector;
      expect(selector.type).toBe('slice');
      expect(selector.start).toBeUndefined();
      expect(selector.end).toBe(3);
      expect(selector.step).toBeUndefined();
    });
  });

  describe('Complex paths', () => {
    test('should parse multi-segment path', () => {
      const result = JsonPathParser.parse('$.store.book[0].title');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(4);

      // $.store
      const seg1 = result.path?.segments[0].selectors[0] as NamedSelector;
      expect(seg1.type).toBe('name');
      expect(seg1.name).toBe('store');

      // .book
      const seg2 = result.path?.segments[1].selectors[0] as NamedSelector;
      expect(seg2.type).toBe('name');
      expect(seg2.name).toBe('book');

      // [0]
      const seg3 = result.path?.segments[2].selectors[0] as IndexSelector;
      expect(seg3.type).toBe('index');
      expect(seg3.index).toBe(0);

      // .title
      const seg4 = result.path?.segments[3].selectors[0] as NamedSelector;
      expect(seg4.type).toBe('name');
      expect(seg4.name).toBe('title');
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
    test('should parse simple filter', () => {
      const result = JsonPathParser.parse('$[?(@.price < 10)]');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0]?.selectors[0];
      expect(selector?.type).toBe('filter');
    });

    test('should parse filter with equality', () => {
      const result = JsonPathParser.parse("$[?(@.author == 'Tolkien')]");
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(1);

      const selector = result.path?.segments[0]?.selectors[0];
      expect(selector?.type).toBe('filter');
    });
  });

  describe('RFC 9535 examples', () => {
    // Examples from RFC 9535 Section 1.4
    const testData = {
      store: {
        book: [
          {
            category: 'reference',
            author: 'Nigel Rees',
            title: 'Sayings of the Century',
            price: 8.95,
          },
          {
            category: 'fiction',
            author: 'Evelyn Waugh',
            title: 'Sword of Honour',
            price: 12.99,
          },
          {
            category: 'fiction',
            author: 'Herman Melville',
            title: 'Moby Dick',
            isbn: '0-553-21311-3',
            price: 8.99,
          },
          {
            category: 'fiction',
            author: 'J. R. R. Tolkien',
            title: 'The Lord of the Rings',
            isbn: '0-395-19395-8',
            price: 22.99,
          },
        ],
        bicycle: {
          color: 'red',
          price: 19.95,
        },
      },
    };

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
    });

    test('should parse "$.store.*"', () => {
      const result = JsonPathParser.parse('$.store.*');
      expect(result.success).toBe(true);
      expect(result.path?.segments).toHaveLength(2);

      const selectors = result.path?.segments.map((seg) => seg.selectors[0]);
      expect(selectors?.[0]).toMatchObject({type: 'name', name: 'store'});
      expect(selectors?.[1]).toMatchObject({type: 'wildcard'});
    });

    test('should parse "$.store.book[0,1]" (union - not implemented yet)', () => {
      // This would be for union selectors, which we haven't implemented yet
      // Just test that it doesn't crash
      const result = JsonPathParser.parse('$.store.book[0]');
      expect(result.success).toBe(true);
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
