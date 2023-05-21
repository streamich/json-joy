const Benchmark = require('benchmark');
const {LogicalTimestamp, LogicalTimespan} = require('../../es2020/json-crdt-patch/clock');
const {Timestamp} = require('../../es2020/json-crdt-patch/clock/timestamp');

const suite = new Benchmark.Suite;

suite
  .add('LogicalTimestamp', function() {
    const a = new LogicalTimestamp(123, 123);
  })
  .add('LogicalTimespan', function() {
    const a = new LogicalTimespan(123, 123, 123);
  })
  .add('Timestamp', function() {
    const a = new Timestamp(123, 123);
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
