// Example: How to run a quick performance test
// Usage: npx ts-node packages/json-path/src/__bench__/example.ts

import {JsonPathEval} from '../JsonPathEval';
import {JsonPathCodegen} from '../JsonPathCodegen';
import {JSONPath} from 'jsonpath-plus';
import {bookstore} from '../__tests__/fixtures';

const query = '$.store.book[*].author';
const iterations = 100000;

console.log(`Running ${iterations} iterations of: ${query}\n`);

// Test JsonPathEval
console.time('JsonPathEval (with parsing)');
for (let i = 0; i < iterations; i++) {
  JsonPathEval.run(query, bookstore);
}
console.timeEnd('JsonPathEval (with parsing)');

// Test JsonPathCodegen
console.time('JsonPathCodegen (with parsing+compile)');
for (let i = 0; i < iterations; i++) {
  JsonPathCodegen.run(query, bookstore);
}
console.timeEnd('JsonPathCodegen (with parsing+compile)');

// Test JsonPathCodegen pre-compiled
import {JsonPathParser} from '../JsonPathParser';
const parser = new JsonPathParser();
const parseResult = parser.parse(query);
if (!parseResult.success || !parseResult.path) {
  throw new Error('Parse failed');
}
const fn = new JsonPathCodegen(parseResult.path).compile();

console.time('JsonPathCodegen (pre-compiled)');
for (let i = 0; i < iterations; i++) {
  fn(bookstore);
}
console.timeEnd('JsonPathCodegen (pre-compiled)');

// Test jsonpath-plus
console.time('jsonpath-plus');
for (let i = 0; i < iterations; i++) {
  JSONPath({path: query, json: bookstore, wrap: false});
}
console.timeEnd('jsonpath-plus');

console.log('\nNote: Lower time is better. Pre-compiled should be fastest.');
