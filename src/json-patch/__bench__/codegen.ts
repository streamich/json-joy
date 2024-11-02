/* tslint:disable no-console */

import * as Benchmark from 'benchmark';
import {operationToOp} from '../codec/json';
import type {Operation} from '../types';
import {applyOps} from '../applyPatch';
import {apply, $apply} from '../codegen/apply';

const message = {
  cloudEvent: {
    type: 'user.login',
    producer: '/uk/london/dc2/rack5/unit8',
  },
};

const patch: Operation[] = [
  {op: 'test', path: '/cloudEvent/type', value: 'user.login'},
  {op: 'starts', path: '/cloudEvent/producer', value: '/uk/london/dc2/ra'},
  {op: 'add', path: '/cloudEvent/foo', value: 'bar`'},
];

const ops = patch.map((op) => operationToOp(op, {}));

const suite = new Benchmark.Suite();

const applyCompiled = $apply(patch, {mutate: false});

suite
  .add('json-patch/apply(patch, {}, message)', () => {
    apply(patch, {mutate: false}, message);
  })
  .add('json-patch/$apply(patch, {})(message)', () => {
    $apply(patch, {mutate: false})(message);
  })
  .add('json-patch/applyOps', () => {
    applyOps(message, ops, false);
  })
  .add('json-patch/applyCompiled', () => {
    applyCompiled(message);
  })
  .on('cycle', (event: any) => {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', () => {
    console.log('Fastest is ' + suite.filter('fastest').map('name'));
  })
  .run();
