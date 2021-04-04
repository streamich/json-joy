const Benchmark = require('benchmark');
const Encoder = require('../es6/json-pack/Encoder').Encoder;
const Decoder = require('../es6/json-pack/Decoder').Decoder;
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

const decoder = new Decoder();
const decode1 = decoder.decode.bind(decoder);

const suite = new Benchmark.Suite;

suite
  .add(`JSON.parse`, function() {
    JSON.parse(str);
  })
  .add(`@msgpack/msgpack`, function() {
    decode(uint8, 0);
  })
  .add(`json-joy/json-pack`, function() {
    decode1(uint8, 0);
  })
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
