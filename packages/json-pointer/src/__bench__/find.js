const Benchmark = require('benchmark');
const {parseJsonPointer} = require('../../../es6/json-pointer');
const {find} = require('../../../es6/json-pointer/find');
const {parseJsonPointer: parseJsonPointerEs5} = require('../../../lib/json-pointer');
const {find: findEs5} = require('../../../lib/json-pointer/find');
const {findByPointer: findByPointerV1} = require('../../../es6/json-pointer/findByPointer/v1');
const {findByPointer: findByPointerV2} = require('../../../es6/json-pointer/findByPointer/v2');
const {findByPointer: findByPointerV3} = require('../../../es6/json-pointer/findByPointer/v3');
const {findByPointer: findByPointerV4} = require('../../../es6/json-pointer/findByPointer/v4');
const {findByPointer: findByPointerV5} = require('../../../es6/json-pointer/findByPointer/v5');
const {findByPointer: findByPointerV6} = require('../../../es6/json-pointer/findByPointer/v6');

const suite = new Benchmark.Suite();

const doc = {
  foo: {
    bar: [
      {
        baz: 123,
      },
    ],
  },
};

suite
  .add(`find`, () => {
    const pointer = parseJsonPointer('/foo/bar/0/baz');
    find(doc, pointer);
  })
  .add(`find ES5`, () => {
    const pointer = parseJsonPointerEs5('/foo/bar/0/baz');
    findEs5(doc, pointer);
  })
  .add(`findByPointer (v1)`, () => {
    findByPointerV1('/foo/bar/0/baz', doc);
  })
  .add(`findByPointer (v2)`, () => {
    findByPointerV2('/foo/bar/0/baz', doc);
  })
  .add(`findByPointer (v3)`, () => {
    findByPointerV3('/foo/bar/0/baz', doc);
  })
  .add(`findByPointer (v4)`, () => {
    findByPointerV4('/foo/bar/0/baz', doc);
  })
  .add(`findByPointer (v5)`, () => {
    findByPointerV5('/foo/bar/0/baz', doc);
  })
  .add(`findByPointer (v6)`, () => {
    findByPointerV6('/foo/bar/0/baz', doc);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
