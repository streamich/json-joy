/* tslint:disable no-console */

// Run: npx ts-node packages/json-path/src/__bench__/bench.jsonpath.ts

import * as Benchmark from 'benchmark';
import {JsonPathParser} from '../JsonPathParser';
import {JsonPathEval} from '../JsonPathEval';
import {JsonPathCodegen} from '../JsonPathCodegen';
import {JSONPath} from 'jsonpath-plus';
import {bookstore} from '../__tests__/fixtures';

const suite = new Benchmark.Suite();

// JSONPath expressions to benchmark
const queries = {
  simple: '$.store.book[*].author',
  recursive: '$..author',
  filter: '$.store.book[?@.price<10]',
  function: '$.store.book[?length(@.author)>10]',
  wildcard: '$.store.*',
};

// Pre-parse and compile for fair comparison
const parser = new JsonPathParser();
const compiled: Record<string, any> = {};

Object.entries(queries).forEach(([key, query]) => {
  const parseResult = parser.parse(query);
  if (parseResult.success && parseResult.path) {
    compiled[key] = {
      ast: parseResult.path,
      codegen: new JsonPathCodegen(parseResult.path).compile(),
    };
  }
});

suite
  // Simple query benchmarks
  .add(`[Simple] JsonPathEval (with parsing): ${queries.simple}`, () => {
    JsonPathEval.run(queries.simple, bookstore);
  })
  .add(`[Simple] JsonPathEval (pre-parsed): ${queries.simple}`, () => {
    const evaluator = new JsonPathEval(compiled.simple.ast, bookstore);
    evaluator.eval();
  })
  .add(`[Simple] JsonPathCodegen (with parsing+compile): ${queries.simple}`, () => {
    JsonPathCodegen.run(queries.simple, bookstore);
  })
  .add(`[Simple] JsonPathCodegen (pre-compiled): ${queries.simple}`, () => {
    compiled.simple.codegen(bookstore);
  })
  .add(`[Simple] jsonpath-plus: ${queries.simple}`, () => {
    JSONPath({path: queries.simple, json: bookstore, wrap: false});
  })

  // Recursive descent benchmarks
  .add(`[Recursive] JsonPathEval (with parsing): ${queries.recursive}`, () => {
    JsonPathEval.run(queries.recursive, bookstore);
  })
  .add(`[Recursive] JsonPathEval (pre-parsed): ${queries.recursive}`, () => {
    const evaluator = new JsonPathEval(compiled.recursive.ast, bookstore);
    evaluator.eval();
  })
  .add(`[Recursive] JsonPathCodegen (with parsing+compile): ${queries.recursive}`, () => {
    JsonPathCodegen.run(queries.recursive, bookstore);
  })
  .add(`[Recursive] JsonPathCodegen (pre-compiled): ${queries.recursive}`, () => {
    compiled.recursive.codegen(bookstore);
  })
  .add(`[Recursive] jsonpath-plus: ${queries.recursive}`, () => {
    JSONPath({path: queries.recursive, json: bookstore, wrap: false});
  })

  // Filter query benchmarks
  .add(`[Filter] JsonPathEval (with parsing): ${queries.filter}`, () => {
    JsonPathEval.run(queries.filter, bookstore);
  })
  .add(`[Filter] JsonPathEval (pre-parsed): ${queries.filter}`, () => {
    const evaluator = new JsonPathEval(compiled.filter.ast, bookstore);
    evaluator.eval();
  })
  .add(`[Filter] JsonPathCodegen (with parsing+compile): ${queries.filter}`, () => {
    JsonPathCodegen.run(queries.filter, bookstore);
  })
  .add(`[Filter] JsonPathCodegen (pre-compiled): ${queries.filter}`, () => {
    compiled.filter.codegen(bookstore);
  })
  .add(`[Filter] jsonpath-plus: ${queries.filter}`, () => {
    JSONPath({path: queries.filter, json: bookstore, wrap: false});
  })

  // Function query benchmarks
  .add(`[Function] JsonPathEval (with parsing): ${queries.function}`, () => {
    JsonPathEval.run(queries.function, bookstore);
  })
  .add(`[Function] JsonPathEval (pre-parsed): ${queries.function}`, () => {
    const evaluator = new JsonPathEval(compiled.function.ast, bookstore);
    evaluator.eval();
  })
  .add(`[Function] JsonPathCodegen (with parsing+compile): ${queries.function}`, () => {
    JsonPathCodegen.run(queries.function, bookstore);
  })
  .add(`[Function] JsonPathCodegen (pre-compiled): ${queries.function}`, () => {
    compiled.function.codegen(bookstore);
  })
  .add(`[Function] jsonpath-plus: ${queries.function}`, () => {
    JSONPath({path: queries.function, json: bookstore, wrap: false});
  })

  // Wildcard query benchmarks
  .add(`[Wildcard] JsonPathEval (with parsing): ${queries.wildcard}`, () => {
    JsonPathEval.run(queries.wildcard, bookstore);
  })
  .add(`[Wildcard] JsonPathEval (pre-parsed): ${queries.wildcard}`, () => {
    const evaluator = new JsonPathEval(compiled.wildcard.ast, bookstore);
    evaluator.eval();
  })
  .add(`[Wildcard] JsonPathCodegen (with parsing+compile): ${queries.wildcard}`, () => {
    JsonPathCodegen.run(queries.wildcard, bookstore);
  })
  .add(`[Wildcard] JsonPathCodegen (pre-compiled): ${queries.wildcard}`, () => {
    compiled.wildcard.codegen(bookstore);
  })
  .add(`[Wildcard] jsonpath-plus: ${queries.wildcard}`, () => {
    JSONPath({path: queries.wildcard, json: bookstore, wrap: false});
  })

  // Event handlers
  .on('cycle', (event: any) => {
    console.log(String(event.target));
  })
  .on('complete', function (this: any) {
    console.log('\n=== Results Summary ===');
    
    // Group results by query type
    const groups = ['Simple', 'Recursive', 'Filter', 'Function', 'Wildcard'];
    
    groups.forEach((group) => {
      const groupTests = this.filter((bench: any) => bench.name.startsWith(`[${group}]`));
      if (groupTests.length > 0) {
        console.log(`\n${group} Query:`);
        
        // Sort by ops/sec
        const sorted = groupTests.sort((a: any, b: any) => b.hz - a.hz);
        sorted.forEach((bench: any, index: number) => {
          const name = bench.name.replace(`[${group}] `, '');
          const opsPerSec = bench.hz.toLocaleString('en-US', {maximumFractionDigits: 0});
          const relative = index === 0 ? '' : ` (${(sorted[0].hz / bench.hz).toFixed(2)}x slower)`;
          console.log(`  ${index + 1}. ${name}: ${opsPerSec} ops/sec${relative}`);
        });
      }
    });
  })
  .run();


