const Benchmark = require('benchmark');
const {operationToOp} = require('../es6/json-patch');
const {applyPatch, applyOps} = require('../es6/json-patch/applyPatch/v1');
const {applyPatch: v2} = require('../es6/json-patch/applyPatch/v2');
const {applyPatch: v3} = require('../es6/json-patch/applyPatch/v3');
const {applyPatch: v4} = require('../es6/json-patch/applyPatch/v4');
const {applyPatch: applyPatchFastJsonPatch} = require('fast-json-patch');
const {deepClone} = require('../es6/json-patch/util');

const doc = { foo: { bar: 123 }, arr: [1, {}] };
const patch = [
  {op: 'add', path: '/foo/baz', value: 666},
  {op: 'add', path: '/foo/bx', value: 666},
  {op: 'add', path: '/asdf', value: 'asdfadf asdf'},
  {op: 'move', path: '/arr/0', from: '/arr/1'},
  {op: 'replace', path: '/foo/baz', value: 'lorem ipsum'},
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
  // .add(`json-joy (applyPatch v2)`, function() {
  //   v2(doc, patch, false);
  // })
  .add(`json-joy (applyPatch v3)`, function() {
    v3(doc, patch, false);
  })
  .add(`json-joy (applyPatch v4)`, function() {
    v4(doc, patch, false);
  })
  .add(`json-joy (applyOps)`, function() {
    applyOps(doc, ops, false);
  })
  .add(`fast-json-patch`, function() {
    applyPatchFastJsonPatch(doc, patch, false, false);
  })
  .add(`fast-json-patch (fast clone)`, function() {
    const doc2 = deepClone(doc);
    applyPatchFastJsonPatch(doc2, patch, false, true);
  })
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
