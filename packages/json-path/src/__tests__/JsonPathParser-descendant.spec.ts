import {JsonPathParser} from '../JsonPathParser';
import {toTree} from 'pojo-dump';

describe('JsonPathParser - @.. descendant parsing tests', () => {
  test('should parse @.. wildcard descendant selector', () => {
    const result = JsonPathParser.parse('$[?count(@..*) > 0]');
    // console.log(toTree(result.path));
    // console.log(result.path + '');
  });

  test('should parse @.. named descendant selector', () => {
    const result = JsonPathParser.parse('$[?count(@..price) > 0]');
    expect(result.success).toBe(true);
  });

  test('should parse @.. with comparison', () => {
    const result = JsonPathParser.parse('$[?value(@..color) == "red"]');
    expect(result.success).toBe(true);
  });

  test('should parse nested @.. expressions', () => {
    const result = JsonPathParser.parse('$[?count(@..author) == count(@..book)]');
    // console.log(toTree(result.path));
    expect(result.success).toBe(true);
  });

  test('should fail gracefully on incomplete @.. syntax', () => {
    const result = JsonPathParser.parse('$[?count(@..) > 0]');
    expect(result.success).toBe(false);
  });

  test('should parse @.. with bracket notation wildcard', () => {
    const result = JsonPathParser.parse('$[?count(@..[*]) > 0]');
    expect(result.success).toBe(true);
  });

  test('should parse @.. with bracket notation index', () => {
    const result = JsonPathParser.parse('$[?count(@..[0]) > 0]');
    expect(result.success).toBe(true);
  });
});
