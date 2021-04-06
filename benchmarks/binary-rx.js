const Benchmark = require('benchmark');
const Encoder = require('../es6/binary-rx/codec/Encoder').Encoder;
const SubscribeMessage = require('../es6/binary-rx/messages/SubscribeMessage').SubscribeMessage;
const MsgPackEncoder = require('../es6/json-pack/Encoder').Encoder;

const encoder = new Encoder();
const msgPackEncoder = new MsgPackEncoder();

const suite = new Benchmark.Suite;

suite
  .add(`json-joy/binary-rx`, function() {
    const msg = new SubscribeMessage(123, 'service.createResource', Buffer.from('hello world'))
    encoder.encode(msg);
  })
  .add(`JSON-Rx with JSON.stringify`, function() {
    JSON.stringify([123, 'service.createResource', 'hello world']);
  })
  .add(`JSON-Rx with json-pack`, function() {
    msgPackEncoder.encode([123, 'service.createResource', 'hello world']);
  })
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
