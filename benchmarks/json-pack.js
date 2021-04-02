const Benchmark = require('benchmark');
const Encoder2 = require('../es6/json-pack/Encoder/v2').Encoder;
const Encoder3 = require('../es6/json-pack/Encoder/v3').Encoder;
const msgpack5 = require('msgpack5')().encode;
const msgpackLite = require("msgpack-lite").encode;
const msgpack = require('msgpack').pack;
const messagepack = require('messagepack').encode;
const atMsgpackMsgpack = require('@msgpack/msgpack').encode;

const encoder2 = new Encoder2();
const jsonPack2 = encoder2.encode.bind(encoder2);
const encoder3 = new Encoder3();
const jsonPack3 = encoder3.encode.bind(encoder3);

const patch = [
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

const suite = new Benchmark.Suite;

suite
  .add(`json-joy/json-pack (v2)`, function() {
    jsonPack2(patch);
  })
  .add(`json-joy/json-pack (v3)`, function() {
    jsonPack3(patch);
  })
  .add(`JSON.stringify`, function() {
    JSON.stringify(patch);
  })
  .add(`@msgpack/msgpack`, function() {
    atMsgpackMsgpack(patch);
  })
  .add(`msgpack-lite`, function() {
    msgpackLite(patch);
  })
  .add(`msgpack`, function() {
    msgpack(patch);
  })
  .add(`msgpack5`, function() {
    msgpack5(patch);
  })
  .add(`messagepack`, function() {
    messagepack(patch);
  })
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
