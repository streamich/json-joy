const Benchmark = require('benchmark');
const JsonExpressionCodegen = require('../../es2020/json-expression').JsonExpressionCodegen;
const evaluate = require('../../es2020/json-expression').evaluate;

const json = {
  "specversion" : "1.0",
  "type" : "com.example.someevent",
  "source" : "/mycontext",
  "subject": null,
  "id" : "C234-1234-1234",
  "time" : "2018-04-05T17:31:00Z",
  "comexampleextension1" : "value",
  "comexampleothervalue" : 5,
  "datacontenttype" : "application/json",
  "data" : {
      "appinfoA" : "abc",
      "appinfoB" : 123,
      "appinfoC" : true
  }
};

const expression = ['and',
  ['==', ['get', '/specversion'], '1.0'],
  ['starts', ['get', '/type'], 'com.example.'],
  ['in', ['get', '/datacontenttype'], [['application/octet-stream', 'application/json']]],
  ['==', ['=', '/data/appinfoA'], 'abc'],
];

const codegen = new JsonExpressionCodegen({expression});
const fn = codegen.run().compile();

const suite = new Benchmark.Suite;
suite
  .add(`json-joy/json-expression JsonExpressionCodegen`, function() {
    fn({data: json});
  })
  .add(`json-joy/json-expression JsonExpressionCodegen with codegen`, function() {
    const codegen = new JsonExpressionCodegen({expression});
    const fn = codegen.run().compile();
    fn({data: json});
  })
  .add(`json-joy/json-expression evaluate`, function() {
    evaluate(expression, {data: json})
  })
  .on('cycle', function(event) {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
