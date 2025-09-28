import { JsonPathParser } from '../JsonPathParser';

describe('JSONPath Segmentation Debug', () => {
  test('debug different segmentation patterns', () => {
    // Test the working case
    console.log('=== Testing: $.store.book[0,1] ===');
    const result1 = JsonPathParser.parse('$.store.book[0,1]');
    console.log('Segments:', result1.path?.segments.length);
    console.log('Last segment selectors:', result1.path?.segments[2]?.selectors.length);
    
    // Test our problematic case
    console.log('\n=== Testing: @.book[0].author ===');
    const result2 = JsonPathParser.parse('$[@.book[0].author]'); // Just to parse the path part
    // Let's parse just the path part manually
    const parser = new JsonPathParser();
    parser.reset('.book[0].author');
    const segments = parser['parsePathSegments']();
    console.log('Segments from .book[0].author:', segments.length);
    segments.forEach((segment: any, index: number) => {
      console.log(`Segment ${index} selectors:`, segment.selectors.length, segment.selectors);
    });
  });
});