/* tslint:disable no-console */

import {JsonPathParser} from '../JsonPathParser';

const queries = [
  '$.store.book[*].author',
  '$..author',
  '$.store.book[?@.price<10]',
  '$.store.book[?length(@.author)>10]',
  '$.store.*',
];

const iterations = 100000;

console.log(`Profiling parser with ${iterations} iterations\n`);

queries.forEach((query) => {
  console.log(`Query: ${query}`);

  // Test with new parser each time (like JsonPathParser.parse does)
  console.time('  New parser each time');
  for (let i = 0; i < iterations; i++) {
    const parser = new JsonPathParser();
    parser.parse(query);
  }
  console.timeEnd('  New parser each time');

  // Test with reused parser
  const reuseParser = new JsonPathParser();
  console.time('  Reused parser');
  for (let i = 0; i < iterations; i++) {
    reuseParser.parse(query);
  }
  console.timeEnd('  Reused parser');

  console.log('');
});

// Now test what jsonpath-plus does
console.log('Testing jsonpath-plus for comparison:');
import {JSONPath} from 'jsonpath-plus';
const simpleQuery = '$.store.book[*].author';
const data = {store: {book: [{author: 'test'}]}};

console.time('jsonpath-plus parse+eval');
for (let i = 0; i < iterations; i++) {
  JSONPath({path: simpleQuery, json: data, wrap: false});
}
console.timeEnd('jsonpath-plus parse+eval');
