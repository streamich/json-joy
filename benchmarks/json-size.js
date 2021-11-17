const Benchmark = require('benchmark');
const jsonSize = require('../es6/json-size').jsonSize;
const jsonSizeApprox = require('../es6/json-size').jsonSizeApprox;
const jsonSizeFast = require('../es6/json-size').jsonSizeFast;
const msgpackSizeFast = require('../es6/json-size').msgpackSizeFast;
const utf8Count = require('../es6/util/utf8').utf8Count;

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
      longString: 'lorem ipsum dolorem, alamorem colomorem, ipsum pipsum, lorem ipsum dolorem, alamorem colomorem, ipsum pipsum, lorem ipsum dolorem, alamorem colomorem, ipsum pipsum, lorem ipsum dolorem, alamorem colomorem, ipsum pipsum, lorem ipsum dolorem, alamorem colomorem, ipsum pipsum',
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
  .add(`json-joy/json-size jsonSize()`, function() {
    jsonSize(json);
  })
  .add(`json-joy/json-size jsonSizeApprox()`, function() {
    jsonSizeApprox(json);
  })
  .add(`json-joy/json-size jsonSizeFast()`, function() {
    jsonSizeFast(json);
  })
  .add(`json-joy/json-size msgpackSizeFast()`, function() {
    msgpackSizeFast(json);
  })
  .add(`JSON.stringify`, function() {
    JSON.stringify(json).length;
  })
  .add(`JSON.stringify + utf8Count`, function() {
    utf8Count(JSON.stringify(json));
  })
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
