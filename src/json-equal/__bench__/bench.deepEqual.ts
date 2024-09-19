// npx ts-node src/json-equal/__bench__/bench.deepEqual.ts

/* tslint:disable no-console */

import * as Benchmark from 'benchmark';
import {deepEqual as deepEqualV1} from '../deepEqual/v1';
import {deepEqual as deepEqualV2} from '../deepEqual/v2';
import {deepEqual as deepEqualV3} from '../deepEqual/v3';
import {deepEqual as deepEqualV4} from '../deepEqual/v4';
import {deepEqual as deepEqualV5} from '../deepEqual/v5';
import {$$deepEqual} from '../$$deepEqual';

const json1 = {
  foo: 'bar',
  ff: 123,
  gg: [4, 3, 'f'],
};
const json2 = {
  foo: 'bar',
  ff: 123,
  gg: [4, 3, 'f.'],
};

// tslint:disable-next-line no-eval eval ban
const equalGenerated1 = eval($$deepEqual(json1));

const suite = new Benchmark.Suite();

suite
  .add(`json-joy/json-equal (v1)`, () => {
    deepEqualV1(json1, json2);
  })
  .add(`json-joy/json-equal (v2)`, () => {
    deepEqualV2(json1, json2);
  })
  .add(`json-joy/json-equal (v3)`, () => {
    deepEqualV3(json1, json2);
  })
  .add(`json-joy/json-equal (v4)`, () => {
    deepEqualV4(json1, json2);
  })
  .add(`json-joy/json-equal (v5)`, () => {
    deepEqualV5(json1, json2);
  })
  .add(`json-joy/json-equal/$$deepEqual`, () => {
    equalGenerated1(json2);
  })
  .add(`json-joy/json-equal/$$deepEqual (with codegen)`, () => {
    // tslint:disable-next-line no-eval eval ban
    const equalGenerated1 = eval($$deepEqual(json1));
    equalGenerated1(json2);
  })
  .on('cycle', (event: any) => {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', () => {
    console.log('Fastest is ' + suite.filter('fastest').map('name'));
  })
  .run();
