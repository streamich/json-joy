const Benchmark = require('benchmark');
const Encoder2 = require('../es6/json-pack/Encoder/v2').Encoder;
const Encoder3 = require('../es6/json-pack/Encoder/v3').Encoder;
const Encoder4 = require('../es6/json-pack/Encoder/v4').Encoder;
const msgpack5 = require('msgpack5')().encode;
const msgpackLite = require("msgpack-lite").encode;
const msgpack = require('msgpack').pack;
const messagepack = require('messagepack').encode;
const atMsgpackMsgpack = require('@msgpack/msgpack').encode;

const encoder2 = new Encoder2();
const jsonPack2 = encoder2.encode.bind(encoder2);
const encoder3 = new Encoder3();
const jsonPack3 = encoder3.encode.bind(encoder3);
const encoder4 = new Encoder4();
const jsonPack4 = encoder4.encode.bind(encoder4);

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
// const json = [9, 'service.method', {patch: [{op: 'add', path: '/foo/baz', value: 666}]}];

const suite = new Benchmark.Suite;

suite
  .add(`json-joy/json-pack (v4)`, function() {
    jsonPack4(json);
  })
  .add(`json-joy/json-pack (v3)`, function() {
    jsonPack3(json);
  })
  .add(`json-joy/json-pack (v2)`, function() {
    jsonPack2(json);
  })
  .add(`JSON.stringify`, function() {
    JSON.stringify(json);
  })
  .add(`@msgpack/msgpack`, function() {
    atMsgpackMsgpack(json);
  })
  .add(`msgpack-lite`, function() {
    msgpackLite(json);
  })
  .add(`msgpack`, function() {
    msgpack(json);
  })
  .add(`msgpack5`, function() {
    msgpack5(json);
  })
  .add(`messagepack`, function() {
    messagepack(json);
  })
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
