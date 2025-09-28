import { JsonPathParser } from '../JsonPathParser';

describe('JSONPath Logical Debug', () => {
  test('debug logical AND', () => {
    console.log('Testing: $[?(@.price < 10 && @.author == "Tolkien")]');
    const result = JsonPathParser.parse('$[?(@.price < 10 && @.author == "Tolkien")]');
    console.log('Parse result:', JSON.stringify(result, null, 2));
  });

  test('debug logical OR', () => {
    console.log('Testing: $[?(@.price < 10 || @.price > 100)]');
    const result = JsonPathParser.parse('$[?(@.price < 10 || @.price > 100)]');
    console.log('Parse result:', JSON.stringify(result, null, 2));
  });
});