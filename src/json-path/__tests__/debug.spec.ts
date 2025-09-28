/**
 * Debug test for JSONPath filter parsing
 */

import {JsonPathParser} from '../index';

describe('JSONPath Debug', () => {
  test('debug simple filter', () => {
    console.log('Testing: $[?(@.price < 10)]');
    const result = JsonPathParser.parse('$[?(@.price < 10)]');
    console.log('Parse result:', JSON.stringify(result, null, 2));
  });

  test('debug existence filter', () => {
    console.log('Testing: $[?(@.isbn)]');
    const result = JsonPathParser.parse('$[?(@.isbn)]');
    console.log('Parse result:', JSON.stringify(result, null, 2));
  });

  test('debug simple path', () => {
    console.log('Testing: $.price');
    const result = JsonPathParser.parse('$.price');
    console.log('Parse result:', JSON.stringify(result, null, 2));
  });
});