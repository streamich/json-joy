/**
 * JSONPath utility functions tests
 */

import {JsonPathParser} from '../index';
import {jsonPathToString, jsonPathEquals, getAccessedProperties} from '../util';

describe('JSONPath utilities', () => {
  describe('jsonPathToString', () => {
    test('should convert simple path to string', () => {
      const result = JsonPathParser.parse('$.name');
      expect(result.success).toBe(true);
      const str = jsonPathToString(result.path!);
      expect(str).toBe('$.name');
    });

    test('should convert complex path to string', () => {
      const result = JsonPathParser.parse('$.store.book[0].title');
      expect(result.success).toBe(true);
      const str = jsonPathToString(result.path!);
      expect(str).toBe('$.store.book[0].title');
    });

    test('should convert wildcard to string', () => {
      const result = JsonPathParser.parse('$.store.*');
      expect(result.success).toBe(true);
      const str = jsonPathToString(result.path!);
      expect(str).toBe('$.store.*');
    });

    test('should convert slice to string', () => {
      const result = JsonPathParser.parse('$.items[1:3]');
      expect(result.success).toBe(true);
      const str = jsonPathToString(result.path!);
      expect(str).toBe('$.items[1:3]');
    });

    test('should convert slice with step to string', () => {
      const result = JsonPathParser.parse('$.items[1:10:2]');
      expect(result.success).toBe(true);
      const str = jsonPathToString(result.path!);
      expect(str).toBe('$.items[1:10:2]');
    });

    test('should convert union selector to string', () => {
      const result = JsonPathParser.parse("$.store['book', 'bicycle'][0, 1]");
      expect(result.success).toBe(true);
      const str = jsonPathToString(result.path!);
      expect(str).toBe("$.store[.book,.bicycle][[0],[1]]");
    });

    test('should convert mixed union selector to string', () => {
      const result = JsonPathParser.parse("$[0, 'name', 2]");
      expect(result.success).toBe(true);
      const str = jsonPathToString(result.path!);
      expect(str).toBe("$[[0],.name,[2]]");
    });
  });

  describe('jsonPathEquals', () => {
    test('should return true for identical paths', () => {
      const result1 = JsonPathParser.parse('$.store.book[0].title');
      const result2 = JsonPathParser.parse('$.store.book[0].title');
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(jsonPathEquals(result1.path!, result2.path!)).toBe(true);
    });

    test('should return false for different paths', () => {
      const result1 = JsonPathParser.parse('$.store.book[0].title');
      const result2 = JsonPathParser.parse('$.store.book[1].title');
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(jsonPathEquals(result1.path!, result2.path!)).toBe(false);
    });

    test('should return true for equivalent bracket and dot notation', () => {
      const result1 = JsonPathParser.parse('$.store.book');
      const result2 = JsonPathParser.parse("$['store']['book']");
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(jsonPathEquals(result1.path!, result2.path!)).toBe(true);
    });

    test('should return false for paths of different length', () => {
      const result1 = JsonPathParser.parse('$.store.book');
      const result2 = JsonPathParser.parse('$.store.book[0]');
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(jsonPathEquals(result1.path!, result2.path!)).toBe(false);
    });
  });

  describe('getAccessedProperties', () => {
    test('should extract property names from simple path', () => {
      const result = JsonPathParser.parse('$.store.book');
      expect(result.success).toBe(true);
      const properties = getAccessedProperties(result.path!);
      expect(properties).toEqual(['store', 'book']);
    });

    test('should extract properties from mixed path', () => {
      const result = JsonPathParser.parse('$.store.book[0].title');
      expect(result.success).toBe(true);
      const properties = getAccessedProperties(result.path!);
      expect(properties).toEqual(['store', 'book', 'title']);
    });

    test('should extract properties from recursive descent', () => {
      const result = JsonPathParser.parse('$..author');
      expect(result.success).toBe(true);
      const properties = getAccessedProperties(result.path!);
      expect(properties).toEqual(['author']);
    });

    test('should handle wildcard and slice selectors', () => {
      const result = JsonPathParser.parse('$.store.*[1:3]');
      expect(result.success).toBe(true);
      const properties = getAccessedProperties(result.path!);
      expect(properties).toEqual(['store']);
    });

    test('should handle empty result for root only', () => {
      const result = JsonPathParser.parse('$');
      expect(result.success).toBe(true);
      const properties = getAccessedProperties(result.path!);
      expect(properties).toEqual([]);
    });
  });
});
