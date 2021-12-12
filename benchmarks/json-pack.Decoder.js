const Benchmark = require('benchmark');
const Encoder = require('../es6/json-pack/Encoder').Encoder;
const Decoder9 = require('../es6/json-pack/Decoder/v9').Decoder;
const {Decoder} = require("@msgpack/msgpack");
const msgpackLite = require("msgpack-lite").decode;
const msgpack5 = require('msgpack5')().decode;
const messagepack = require('messagepack').decode;

const decoderMsgpack = new Decoder(
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  null,
);
const decode = decoderMsgpack.decode.bind(decoderMsgpack);

const json = [
  {op: 'add', path: '/foo/baz', value: 666},
  {op: 'add', path: '/foo/bx', value: 666},
  {op: 'add', path: '/asdf', value: 'asdfadf asdf'},
  {op: 'move', path: '/arr/0', from: '/arr/1'},
  {op: 'replace', path: '/foo/baz', value: 'lorem ipsum'},
  {op: 'add', path: '/docs/latest', value: {
    name: 'blog post',
    json: {
      id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      author: {
        name: 'John 💪',
        handle: '@johny',
      },
      lastSeen: -12345,
      tags: [null, 'Sports 🏀', 'Personal', 'Travel'],
      pins: [{
        id: 1239494
      }],
      marks: [
        {
          x: 1,
          y: 1.234545,
          w: 0.23494,
          h: 0,
        }
      ],
      hasRetweets: false,
      approved: true,
      '👍': 33,
    },
  }},
];
const encoder = new Encoder();
const uint8 = encoder.encode(json);
const str = JSON.stringify(json);

const decoder9 = new Decoder9();
const decode9 = decoder9.decode.bind(decoder9);

const suite = new Benchmark.Suite;

suite
  .add(`json-joy/json-pack (v9)`, function() {
    decode9(uint8);
  })
  .add(`JSON.parse`, function() {
    JSON.parse(str);
  })
  .add(`@msgpack/msgpack`, function() {
    decode(uint8);
  })
  .add(`msgpack-lite`, function() {
    msgpackLite(uint8);
  })
  .add(`msgpack5`, function() {
    msgpack5(uint8);
  })
  .add(`messagepack`, function() {
    messagepack(uint8);
  })
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
