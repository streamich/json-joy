const Benchmark = require('benchmark');
const {Encoder} = require('../../es2020/json-crdt/codec/binary/Encoder');
const {ts, Timestamp} = require('../../es2020/json-crdt-patch/clock');

const encoder = new Encoder();
// const stamp = ts(Math.round(Math.random() * 0xFFFFFFFFFFF), Math.round(Math.random() * 0xFFFFFFFFFFF));
const stamp = new Timestamp(Math.round(Math.random() * 0xFFFFFFFFFFF), 123);

const suite = new Benchmark.Suite;

suite
  .add('id()', function() {
    encoder.reset();
    encoder.id(stamp.sid, stamp.time);
    encoder.flush();
  })
  .add('two MessagePack integers', function() {
    encoder.reset();
    encoder.encodeInteger(stamp.sid);
    encoder.encodeInteger(stamp.time);
    encoder.flush();
  })
  .add('64-bit sid + vint time', function() {
    encoder.reset();
    encoder.f64(stamp.sid);
    encoder.vuint39(stamp.time);
    encoder.flush();
  })
  .add('vint sid + vint time', function() {
    encoder.reset();
    encoder.vuint57(stamp.sid);
    encoder.vuint39(stamp.time);
    encoder.flush();
  })
  .add('64-bit sid + 32-bit time', function() {
    encoder.reset();
    encoder.f64(stamp.sid);
    encoder.u32(stamp.time);
    encoder.flush();
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
