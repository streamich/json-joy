const Benchmark = require('benchmark');
const {parseJsonPointer} = require('../es6/json-pointer');

const suite = new Benchmark.Suite;

suite
  .add(`parseJsonPointer ""`, function() {
    parseJsonPointer('')
  })
  .add(`parseJsonPointer "/"`, function() {
    parseJsonPointer('/')
  })
  .add(`parseJsonPointer "/foo"`, function() {
    parseJsonPointer('/foo')
  })
  .add(`parseJsonPointer "/foo/bar/baz"`, function() {
    parseJsonPointer('/foo/bar/baz')
  })
  .add(`parseJsonPointer "/foo/bar/baz/layer~0/123/ok~1test/4"`, function() {
    parseJsonPointer('/foo/bar/baz/layer~0/123/ok~1test/4')
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
