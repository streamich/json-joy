const Benchmark = require('benchmark');
const {applyOps} = require('../../es2020/json-patch');
const {operationToOp} = require('../../es2020/json-patch/codec/json');
const {apply, $apply} = require('../../es2020/json-patch/codegen/apply');

const message = {
  cloudEvent: {
    type: 'user.login',
    producer: '/uk/london/dc2/rack5/unit8'
  },
};

const patch = [
  {op: 'test', path: '/cloudEvent/type', value: 'user.login'},
  {op: 'starts', path: '/cloudEvent/producer', value: '/uk/london/dc2/ra'},
  {op: 'add', path: '/cloudEvent/foo', value: 'bar`'},
];

const ops = patch.map(operationToOp);

const suite = new Benchmark.Suite;

const applyCompiled = $apply(patch, {mutate: false});

suite
  .add(`json-patch/apply(patch, {}, message)`, function() {
    apply(patch, {mutate: false}, message);
  })
  .add(`json-patch/$apply(patch, {})(message)`, function() {
    $apply(patch, {mutate: false})(message);
  })
  .add(`json-patch/applyOps`, function() {
    applyOps(message, ops, false);
  })
  .add(`json-patch/applyCompiled`, function() {
    applyCompiled(message);
  })
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
