import { JsonPathParser } from '../JsonPathParser';

describe('JSONPath Step by Step Debug', () => {
  test('debug with console output in parser', () => {
    // Testing with a simpler case first
    console.log('\n=== Testing simple AND expression ===');
    const simpleResult = JsonPathParser.parse('$[?(@.a && @.b)]');
    console.log('Simple AND result:', JSON.stringify(simpleResult, null, 2));
    
    // Testing the original case
    console.log('\n=== Testing complex AND expression ===');
    const complexResult = JsonPathParser.parse('$[?(@.price < 10 && @.author == "Tolkien")]');
    console.log('Complex AND result:', JSON.stringify(complexResult, null, 2));
  });
});