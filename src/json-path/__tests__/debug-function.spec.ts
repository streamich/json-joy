import { JsonPathParser } from '../JsonPathParser';

describe('JSONPath Function Debug', () => {
  test('debug function expression parsing', () => {
    console.log('Testing: $[?length(@.name) > 5]');
    const result = JsonPathParser.parse('$[?length(@.name) > 5]');
    console.log('Parse result:', JSON.stringify(result, null, 2));
  });
});