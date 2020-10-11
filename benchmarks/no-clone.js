const Benchmark = require('benchmark');
const {operationToOp} = require('../es6/json-patch');
const {applyPatch, applyOps} = require('../es6/json-patch/applyPatch/v1');
const {applyPatch: v3} = require('../es6/json-patch/applyPatch/v3');
const {applyPatch: v4} = require('../es6/json-patch/applyPatch/v4');
const {applyPatch: applyPatchFastJsonPatch} = require('fast-json-patch');

const patch = [
  {op: 'add', path: '/foo/baz', value: 666},
  {op: 'add', path: '/foo/bx', value: 666},
  {op: 'add', path: '/asdf', value: 'asdfadf asdf'},
  {op: 'move', path: '/arr/0', from: '/arr/1'},
  {op: 'replace', path: '/foo/baz', value: 'lorem ipsum'},
];
const ops = patch.map(operationToOp);

const suite = new Benchmark.Suite;

suite
  .add(`json-joy (applyPatch)`, function() {
    const doc = { foo: { bar: 123 }, arr: [1, {}] };
    applyPatch(doc, patch, true);
  })
  .add(`json-joy (applyPatch v3)`, function() {
    const doc = { foo: { bar: 123 }, arr: [1, {}] };
    v3(doc, patch, true);
  })
  .add(`json-joy (applyPatch v4)`, function() {
    const doc = { foo: { bar: 123 }, arr: [1, {}] };
    v4(doc, patch, true);
  })
  .add(`json-joy (applyOps)`, function() {
    const doc = { foo: { bar: 123 }, arr: [1, {}] };
    applyOps(doc, ops, true);
  })
  .add(`fast-json-patch`, function() {
    const doc = { foo: { bar: 123 }, arr: [1, {}] };
    applyPatchFastJsonPatch(doc, patch, false, true);
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
