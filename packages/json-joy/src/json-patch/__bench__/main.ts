/* tslint:disable no-console */

import * as Benchmark from 'benchmark';
import {operationToOp} from '../codec/json';
import type {Operation} from '../types';
import {applyPatch, applyOps} from '../applyPatch';
import {applyPatch as v2} from '../applyPatch/v2';
import {applyPatch as v3} from '../applyPatch/v3';
import {applyPatch as v4} from '../applyPatch/v4';
import {applyPatch as applyPatchFastJsonPatch} from 'fast-json-patch';
import {clone} from '@jsonjoy.com/util/lib/json-clone';

const doc = {foo: {bar: 123}, arr: [1, {}]};
const patch: Operation[] = [
  {op: 'add', path: '/foo/baz', value: 666},
  {op: 'add', path: '/foo/bx', value: 666},
  {op: 'add', path: '/asdf', value: 'asdfadf asdf'},
  {op: 'move', path: '/arr/0', from: '/arr/1'},
  {op: 'replace', path: '/foo/baz', value: 'lorem ipsum'},
];
const ops = patch.map((op) => operationToOp(op, {}));

// console.log(applyOps(doc, ops, false));
// console.log(applyPatch(doc, patch, false));
// console.log(applyPatchFastJsonPatch(doc, patch, false, false));

const suite = new Benchmark.Suite();

suite
  .add('json-joy (applyPatch)', () => {
    applyPatch(doc, patch, {mutate: false});
  })
  .add('json-joy (applyPatch v2)', () => {
    v2(doc, patch, {mutate: false});
  })
  .add('json-joy (applyPatch v3)', () => {
    v3(doc, patch, {mutate: false});
  })
  .add('json-joy (applyPatch v4)', () => {
    v4(doc, patch, {mutate: false});
  })
  .add('json-joy (applyOps)', () => {
    applyOps(doc, ops, false);
  })
  .add('fast-json-patch', () => {
    applyPatchFastJsonPatch(doc, patch as any, false, false);
  })
  .add('fast-json-patch (fast clone)', () => {
    const doc2 = clone(doc);
    applyPatchFastJsonPatch(doc2, patch as any, false, true);
  })
  .on('cycle', (event: any) => {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', () => {
    console.log('Fastest is ' + suite.filter('fastest').map('name'));
  })
  .run();
