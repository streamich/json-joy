import { JsonPathParser } from '../JsonPathParser';

describe('JSONPath Position Debug', () => {
  test('debug position tracking', () => {
    const parser = new JsonPathParser();
    
    // Test the position before and after parsing
    parser.reset('(@.price < 10 && @.author)');
    console.log('Initial position:', parser['pos']);
    console.log('Initial string:', parser['str']);
    console.log('Character at pos 0:', parser['str'][0]);
    
    // Skip the opening paren
    parser['skip'](1);
    parser['ws']();
    console.log('After skipping ( and whitespace, position:', parser['pos']);
    
    try {
      const expression = parser['parseFilterExpression']();
      console.log('Successfully parsed filter expression');
      console.log('Position after parsing filter expression:', parser['pos']);
      console.log('Character at current position:', parser['str'][parser['pos']]);
      console.log('Remaining string:', parser['str'].slice(parser['pos']));
      
      parser['ws']();
      console.log('Position after whitespace:', parser['pos']);
      console.log('Is at ) ?', parser['is'](')'));
      
    } catch (error) {
      console.log('Error during parsing:', error);
      console.log('Position when error occurred:', parser['pos']);
    }
  });
});