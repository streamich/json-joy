const Benchmark = require('benchmark');
const Encoder = require('../es6/json-pack').Encoder;
const msgpack5 = require('msgpack5')().encode;
const msgpackLite = require("msgpack-lite").encode;
const msgpack = require('msgpack').pack;
const messagepack = require('messagepack').encode;
const atMsgpackMsgpack = require('@msgpack/msgpack').encode;

const encoder = new Encoder();
const jsonPack = encoder.encode.bind(encoder);

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
  .add(`json-joy/json-pack`, function() {
    jsonPack(patch);
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
