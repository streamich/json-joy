import { JsonPathParser } from '../JsonPathParser';

describe('JSONPath String Debug', () => {
  test('debug without string literals', () => {
    // Test without string literal
    console.log('Testing: $[?(@.price < 10 && @.author)]');
    const result1 = JsonPathParser.parse('$[?(@.price < 10 && @.author)]');
    console.log('Result without string:', JSON.stringify(result1, null, 2));
    
    // Test with number comparison
    console.log('\nTesting: $[?(@.price < 10 && @.year > 2000)]');
    const result2 = JsonPathParser.parse('$[?(@.price < 10 && @.year > 2000)]');
    console.log('Result with numbers:', JSON.stringify(result2, null, 2));
  });
});