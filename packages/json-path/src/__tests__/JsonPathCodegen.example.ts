/**
 * Example demonstrating JsonPathCodegen usage
 */

import {JsonPathCodegen} from '../JsonPathCodegen';

// Example 1: Compile a simple path expression
const codegen1 = new JsonPathCodegen({
  segments: [
    {
      selectors: [{type: 'name', name: 'store'}],
    },
    {
      selectors: [{type: 'name', name: 'book'}],
    },
    {
      selectors: [{type: 'wildcard'}],
    },
    {
      selectors: [{type: 'name', name: 'title'}],
    },
  ],
});

const compiledFn1 = codegen1.compile();

const data = {
  store: {
    book: [
      {title: 'Book 1', price: 10},
      {title: 'Book 2', price: 15},
      {title: 'Book 3', price: 8},
    ],
  },
};

console.log('Example 1: $.store.book[*].title');
const results1 = compiledFn1(data);
console.log(
  'Results:',
  results1.map((v) => v.data),
);
// Output: ['Book 1', 'Book 2', 'Book 3']

// Example 2: Using static run method (compiles on demand)
console.log('\nExample 2: Using static run method');
const results2 = JsonPathCodegen.run('$.store.book[?@.price < 12].title', data);
console.log(
  'Results:',
  results2.map((v) => v.data),
);
// Output: ['Book 1', 'Book 3']

// Example 3: Demonstrating performance benefit
console.log('\nExample 3: Performance comparison');
const _query = '$.store.book[*].title';

// Compile once, use many times
const compiledFn = new JsonPathCodegen({
  segments: [
    {selectors: [{type: 'name', name: 'store'}]},
    {selectors: [{type: 'name', name: 'book'}]},
    {selectors: [{type: 'wildcard'}]},
    {selectors: [{type: 'name', name: 'title'}]},
  ],
}).compile();

console.log('Compiled function can be reused efficiently for multiple queries on different data');
console.log(
  'Result 1:',
  compiledFn(data).map((v) => v.data),
);
console.log(
  'Result 2:',
  compiledFn({store: {book: [{title: 'New Book'}]}}).map((v) => v.data),
);
