## JSONPath

- JSONPath parser and evaluator implementation based on RFC 9535
- High-performance parser with JIT compilation support
- Faster than `jsonpath-plus` for both interpreted and compiled execution

## Installation

```bash
npm install @jsonjoy.com/json-path
```

## Quick Start

```typescript
import {JsonPathEval, JsonPathCodegen} from '@jsonjoy.com/json-path';

const data = {
  store: {
    book: [
      {category: 'reference', author: 'Nigel Rees', title: 'Sayings of the Century', price: 8.95},
      {category: 'fiction', author: 'Evelyn Waugh', title: 'Sword of Honour', price: 12.99},
      {category: 'fiction', author: 'Herman Melville', title: 'Moby Dick', price: 8.99},
      {category: 'fiction', author: 'J. R. R. Tolkien', title: 'The Lord of the Rings', price: 22.99}
    ],
    bicycle: {color: 'red', price: 19.95}
  }
};

// Using JsonPathEval (interpreter)
const authors = JsonPathEval.run('$.store.book[*].author', data);
console.log(authors);
// ['Nigel Rees', 'Evelyn Waugh', 'Herman Melville', 'J. R. R. Tolkien']

// Using JsonPathCodegen (JIT compiler - faster for repeated queries)
const fn = JsonPathCodegen.compile('$.store.book[?@.price < 10]');
const cheapBooks = fn(data);
console.log(cheapBooks);
// [{category: 'reference', author: 'Nigel Rees', ...}, {category: 'fiction', author: 'Herman Melville', ...}]
```

## API

### JsonPathEval (Interpreter)

Fast interpreter for one-off queries. Parses and evaluates the query in one step.

```typescript
import {JsonPathEval} from '@jsonjoy.com/json-path';

// One-liner
const result = JsonPathEval.run(query, data);

// Or create instance for, which reuses the parsed query
const evaluator = new JsonPathEval(query);
const result1 = evaluator.run(data1);
const result2 = evaluator.run(data2);
```

### JsonPathCodegen (JIT Compiler)

Compiles JSONPath queries to optimized JavaScript functions. Best for queries executed multiple times.

```typescript
import {JsonPathCodegen} from '@jsonjoy.com/json-path';

const fn = JsonPathCodegen.compile(query);

// Now use the compiled function many times
const result1 = fn(data1);
const result2 = fn(data2);
const result3 = fn(data3); // Very fast!
```

## Supported Features (RFC 9535)

- ✅ Root selector (`$`)
- ✅ Named selectors (`$.store.book`)
- ✅ Index selectors (`$[0]`, `$[-1]`)
- ✅ Wildcard selectors (`$[*]`, `$.*`)
- ✅ Slice selectors (`$[0:5]`, `$[::2]`, `$[-5:]`)
- ✅ Filter selectors (`$[?@.price < 10]`)
- ✅ Recursive descent (`$..author`)
- ✅ Comparison operators (`==`, `!=`, `<`, `<=`, `>`, `>=`)
- ✅ Logical operators (`&&`, `||`, `!`)
- ✅ Functions (`length()`, `count()`, `match()`, `search()`, `value()`)

## Query Examples

```typescript
// Select all authors
'$.store.book[*].author'

// Recursive search for all authors
'$..author'

// Filter books cheaper than $10
'$.store.book[?@.price < 10]'

// Books with long author names
'$.store.book[?length(@.author) > 10]'

// Last two books
'$.store.book[-2:]'

// Every other book
'$.store.book[::2]'

// Fiction books cheaper than $15
'$.store.book[?@.category == "fiction" && @.price < 15]'

// All prices in the store
'$.store..price'
```

## Performance

Benchmark results show that `@jsonjoy.com/json-path` is significantly faster
than `jsonpath-plus` in all cases, especially when using the JIT compilation
feature.

```
Simple Query:
  1. JsonPathCodegen (pre-compiled): $.store.book[*].author: 7,235,771 ops/sec
  2. JsonPathEval (pre-parsed): $.store.book[*].author: 2,538,366 ops/sec (2.85x slower)
  3. JsonPathEval (with parsing): $.store.book[*].author: 1,467,835 ops/sec (4.93x slower)
  4. jsonpath-plus: $.store.book[*].author: 1,052,977 ops/sec (6.87x slower)
  5. JsonPathCodegen (with parsing+compile): $.store.book[*].author: 171,191 ops/sec (42.27x slower)

Recursive Query:
  1. JsonPathCodegen (pre-compiled): $..author: 1,351,679 ops/sec
  2. JsonPathEval (pre-parsed): $..author: 889,310 ops/sec (1.52x slower)
  3. JsonPathEval (with parsing): $..author: 786,551 ops/sec (1.72x slower)
  4. jsonpath-plus: $..author: 454,692 ops/sec (2.97x slower)
  5. JsonPathCodegen (with parsing+compile): $..author: 207,286 ops/sec (6.52x slower)

Filter Query:
  1. JsonPathCodegen (pre-compiled): $.store.book[?@.price<10]: 2,453,675 ops/sec
  2. JsonPathEval (pre-parsed): $.store.book[?@.price<10]: 1,377,916 ops/sec (1.78x slower)
  3. JsonPathEval (with parsing): $.store.book[?@.price<10]: 723,664 ops/sec (3.39x slower)
  4. jsonpath-plus: $.store.book[?@.price<10]: 104,480 ops/sec (23.48x slower)
  5. JsonPathCodegen (with parsing+compile): $.store.book[?@.price<10]: 50,037 ops/sec (49.04x slower)

Function Query:
  1. JsonPathCodegen (pre-compiled): $.store.book[?length(@.author)>10]: 1,867,709 ops/sec
  2. JsonPathEval (pre-parsed): $.store.book[?length(@.author)>10]: 1,034,228 ops/sec (1.81x slower)
  3. JsonPathEval (with parsing): $.store.book[?length(@.author)>10]: 565,358 ops/sec (3.30x slower)
  4. jsonpath-plus: $.store.book[?length(@.author)>10]: 103,731 ops/sec (18.01x slower)
  5. JsonPathCodegen (with parsing+compile): $.store.book[?length(@.author)>10]: 40,433 ops/sec (46.19x slower)

Wildcard Query:
  1. JsonPathCodegen (pre-compiled): $.store.*: 14,514,444 ops/sec
  2. JsonPathEval (pre-parsed): $.store.*: 3,702,448 ops/sec (3.92x slower)
  3. JsonPathEval (with parsing): $.store.*: 2,147,839 ops/sec (6.76x slower)
  4. jsonpath-plus: $.store.*: 1,916,578 ops/sec (7.57x slower)
  5. JsonPathCodegen (with parsing+compile): $.store.*: 279,230 ops/sec (51.98x slower)
```

See [`__bench__`](./src/__bench__) for detailed benchmarks and optimization details.

## License

[Apache License 2.0](./LICENSE)