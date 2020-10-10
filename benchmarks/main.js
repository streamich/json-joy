const Benchmark = require('benchmark');
const {operationToOp} = require('../es6/json-patch');
const {applyPatch, applyOps} = require('../es6/json-patch/applyPatch/v1');
const {applyPatch: v2} = require('../es6/json-patch/applyPatch/v2');
const {applyPatch: applyPatchFastJsonPatch} = require('fast-json-patch');

const doc = { foo: { bar: 123 } };
const patch = [
  {op: 'add', path: '/foo/baz', value: 666},
  {op: 'add', path: '/foo/bx', value: 666},
  {op: 'add', path: '/asdf', value: 'asdfadf asdf'},
];
const ops = patch.map(operationToOp);

// console.log(applyOps(doc, ops, false));
// console.log(applyPatch(doc, patch, false));
// console.log(applyPatchFastJsonPatch(doc, patch, false, false));

const suite = new Benchmark.Suite;

suite
  .add(`json-joy (applyPatch)`, function() {
    applyPatch(doc, patch, false);
  })
  .add(`json-joy (applyPatch v2)`, function() {
    v2(doc, patch, false);
  })
  .add(`json-joy (applyOps)`, function() {
    applyOps(doc, ops, false);
  })
  .add(`fast-json-patch`, function() {
    applyPatchFastJsonPatch(doc, patch, false, false);
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
