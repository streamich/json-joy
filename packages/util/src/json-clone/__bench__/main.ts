/* tslint:disable no-console */

import * as Benchmark from 'benchmark';
import {clone} from '..';
import {cloneBinary} from '..';
const v8 = require('v8');
const lodashClone = require('lodash/cloneDeep');

const patch = [
  {op: 'add', path: '/foo/baz', value: 666},
  {op: 'add', path: '/foo/bx', value: 666},
  {op: 'add', path: '/asdf', value: 'asdfadf asdf'},
  {op: 'move', path: '/arr/0', from: '/arr/1'},
  {op: 'replace', path: '/foo/baz', value: 'lorem ipsum'},
];

const suite = new Benchmark.Suite();

suite
  .add(`json-joy/json-clone clone()`, () => {
    clone(patch);
  })
  .add(`json-joy/json-clone cloneBinary()`, () => {
    cloneBinary(patch);
  })
  .add(`JSON.parse(JSON.stringify())`, () => {
    JSON.parse(JSON.stringify(patch));
  })
  .add(`v8.deserialize(v8.serialize(obj))`, () => {
    v8.deserialize(v8.serialize(patch));
  })
  .add(`lodash/cloneDeep`, () => {
    lodashClone(patch);
  })
  .on('cycle', (event: any) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    console.log('Fastest is ' + suite.filter('fastest').map('name'));
  })
  .run();
