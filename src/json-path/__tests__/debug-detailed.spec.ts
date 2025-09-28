import { JsonPathParser } from '../JsonPathParser';

describe('JSONPath Logical Debug Detailed', () => {
  test('debug logical parsing step by step', () => {
    const parser = new JsonPathParser();
    
    // Test the && detection
    console.log('Testing && detection');
    parser.reset('&&');
    console.log('At position 0, is("&&"):', parser['is']('&&'));
    console.log('At position 0, is("&"):', parser['is']('&'));
    
    // Test a simple expression 
    parser.reset('@.price < 10 && @.author');
    console.log('\nParsing "@.price < 10 && @.author"');
    
    // Try to parse just the value expression part
    parser['skip'](1); // Skip @
    parser['ws']();
    const segments = parser['parsePathSegments']();
    console.log('Parsed segments from @.price:', segments);
  });
});