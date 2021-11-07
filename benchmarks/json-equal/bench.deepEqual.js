const Benchmark = require('benchmark');
const deepEqualV1 = require('../../es6/json-equal/deepEqual/v1').deepEqual;
const deepEqualV2 = require('../../es6/json-equal/deepEqual/v2').deepEqual;
const deepEqualV3 = require('../../es6/json-equal/deepEqual/v3').deepEqual;
const deepEqualCodegen = require('../../es6/json-equal/deepEqualCodegen').deepEqualCodegen;
const fastDeepEqual = require('fast-deep-equal/es6');
const fastEquals = require('fast-equals').deepEqual;
const lodashIsEqual = require('lodash').isEqual;

const json1 = require('../fixtures/json-patch').json;
const json2 = JSON.parse(JSON.stringify(json1));
const json3 = {
  foo: 'bar',
  ff: 123,
  gg: [4, 3, 'f']
};
const json4 = {
  foo: 'bar',
  ff: 123,
  gg: [4, 3, 'f.']
};

const equalGenerated1 = eval(deepEqualCodegen(json1));
const equalGenerated2 = eval(deepEqualCodegen(json3));

const suite = new Benchmark.Suite;

suite
  .add(`json-joy/json-equal (v1)`, function() {
    deepEqualV1(json1, json2);
    deepEqualV1(json3, json4);
  })
  .add(`json-joy/json-equal (v2)`, function() {
    deepEqualV2(json1, json2);
    deepEqualV2(json3, json4);
  })
  .add(`json-joy/json-equal (v3)`, function() {
    deepEqualV3(json1, json2);
    deepEqualV3(json3, json4);
  })
  .add(`fast-deep-equal`, function() {
    fastDeepEqual(json1, json2);
    fastDeepEqual(json3, json4);
  })
  .add(`fast-equals`, function() {
    fastEquals(json1, json2);
    fastEquals(json3, json4);
  })
  .add(`lodash.isEqual`, function() {
    lodashIsEqual(json1, json2);
    lodashIsEqual(json3, json4);
  })
  .add(`json-joy/json-equal/deepEqualCodegen`, function() {
    equalGenerated1(json2);
    equalGenerated2(json4);
  })
  .add(`json-joy/json-equal/deepEqualCodegen (with codegen)`, function() {
    const equalGenerated1 = eval(deepEqualCodegen(json1));
    const equalGenerated2 = eval(deepEqualCodegen(json3));
    equalGenerated1(json2);
    equalGenerated2(json4);
  })
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
