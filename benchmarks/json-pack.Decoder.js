const Benchmark = require('benchmark');
const Encoder = require('../es6/json-pack/Encoder').Encoder;
const Decoder1 = require('../es6/json-pack/Decoder/v1').Decoder;
const Decoder2 = require('../es6/json-pack/Decoder/v2').Decoder;
const Decoder3 = require('../es6/json-pack/Decoder/v3').Decoder;
const Decoder4 = require('../es6/json-pack/Decoder/v4').Decoder;
const {decode} = require("@msgpack/msgpack");

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

const decoder1 = new Decoder1();
const decode1 = decoder1.decode.bind(decoder1);
const decoder2 = new Decoder2();
const decode2 = decoder2.decode.bind(decoder2);
const decoder3 = new Decoder3();
const decode3 = decoder3.decode.bind(decoder3);
const decoder4 = new Decoder4();
const decode4 = decoder4.decode.bind(decoder4);

const suite = new Benchmark.Suite;

suite
  .add(`JSON.parse`, function() {
    JSON.parse(str);
  })
  .add(`@msgpack/msgpack`, function() {
    decode(uint8);
  })
  .add(`json-joy/json-pack (v1)`, function() {
    decode1(uint8, 0);
  })
  .add(`json-joy/json-pack (v2)`, function() {
    decode2(uint8, 0);
  })
  .add(`json-joy/json-pack (v3)`, function() {
    decode3(uint8, 0);
  })
  .add(`json-joy/json-pack (v4)`, function() {
    decode4(uint8, 0);
  })
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
