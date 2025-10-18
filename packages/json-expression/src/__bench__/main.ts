/* tslint:disable no-console */

// npx ts-node src/json-expression/__bench__/main.ts

import * as Benchmark from 'benchmark';
import {JsonExpressionCodegen} from '../codegen';
import type {Expr} from '../types';
import {evaluate} from '../evaluate';
import {operatorsMap} from '../operators';
import {Vars} from '../Vars';
const jsonLogic = require('json-logic-js');

const json = {
  specversion: '1.0',
  type: 'com.example.someevent',
  source: '/mycontext',
  subject: null,
  id: 'C234-1234-1234',
  time: '2018-04-05T17:31:00Z',
  comexampleextension1: 'value',
  comexampleothervalue: 5,
  datacontenttype: 'application/json',
  data: {
    appinfoA: 'abc',
    appinfoB: 123,
    appinfoC: true,
  },
};

const expression: Expr = [
  'and',
  ['==', ['get', '/specversion'], '1.0'],
  ['starts', ['get', '/type'], 'com.example.'],
  ['in', ['get', '/datacontenttype'], [['application/octet-stream', 'application/json']]],
  ['==', ['$', '/data/appinfoA'], 'abc'],
];

const jsonLogicExpression = {
  and: [
    {'==': [{var: 'specversion'}, '1.0']},
    {'==': [{substr: [{var: 'type'}, 0, 12]}, 'com.example.']},
    {in: [{var: 'datacontenttype'}, ['application/octet-stream', 'application/json']]},
    {'==': [{var: 'data.appinfoA'}, 'abc']},
  ],
};

const codegen = new JsonExpressionCodegen({expression, operators: operatorsMap});
const fn = codegen.run().compile();

const suite = new Benchmark.Suite();
suite
  .add(`json-joy/json-expression JsonExpressionCodegen`, () => {
    fn({vars: new Vars(json)});
  })
  .add(`json-joy/json-expression JsonExpressionCodegen with codegen`, () => {
    const codegen = new JsonExpressionCodegen({expression, operators: operatorsMap});
    const fn = codegen.run().compile();
    fn({vars: new Vars(json)});
  })
  .add(`json-joy/json-expression evaluate`, () => {
    evaluate(expression, {vars: new Vars(json)});
  })
  .add(`json-logic-js`, () => {
    jsonLogic.apply(jsonLogicExpression, json);
  })
  .on('cycle', (event: any) => {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', () => {
    console.log('Fastest is ' + suite.filter('fastest').map('name'));
  })
  .run();
