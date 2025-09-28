import { JsonPathParser } from '../JsonPathParser';

describe('JSONPath Complex Path Debug', () => {
  test('debug complex path parsing', () => {
    console.log('Testing: $[?(@.book[0].author == "Tolkien")]');
    const result = JsonPathParser.parse('$[?(@.book[0].author == "Tolkien")]');
    console.log('Parse result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      const selector = result.path?.segments[0]?.selectors[0];
      const leftPath = (selector as any)?.expression.left.path;
      console.log('\nPath segments:');
      leftPath.segments.forEach((segment: any, index: number) => {
        console.log(`Segment ${index}:`, segment);
      });
    }
  });
});