const Benchmark = require('benchmark');
const encode = require('../es6/json-pack').encode;
const msgpack5 = require('msgpack5')().encode;
const msgpackLite = require("msgpack-lite").encode;

const patch = [
  {op: 'add', path: '/foo/baz', value: 666},
  {op: 'add', path: '/foo/bx', value: 666},
  {op: 'add', path: '/asdf', value: 'asdfadf asdf'},
  {op: 'move', path: '/arr/0', from: '/arr/1'},
  {op: 'replace', path: '/foo/baz', value: 'lorem ipsum'},
];

const suite = new Benchmark.Suite;

suite
  .add(`JSON.stringify`, function() {
    JSON.stringify(patch);
  })
  .add(`msgpack5`, function() {
    msgpack5(patch);
  })
  .add(`msgpack-lite`, function() {
    msgpackLite(patch);
  })
  .add(`json-pack`, function() {
    encode(patch);
  })
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
