/* tslint:disable no-console */

import * as Benchmark from 'benchmark';
import {apply, validate, type StringOp} from '../types/ot-string';
import {validate as validate2, apply as apply2, type StringOp as StringOp2} from '../types/ot-string-irreversible';
const {type} = require('ot-text');
const {type: type2} = require('ot-text-unicode');
const {delta: d} = require('./util');

const str =
  '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
const op1: StringOp2 = [2, '___', 5, -3, '..', -2, 3, '------', -3, 3, -2, 1, -1, 25, '~~~~', -4];
const op2: StringOp = [2, '___', 5, ['123'], '..', ['12'], 3, '------', ['123'], 3, ['12'], 1, ['1'], 25, '~~~~', -4];
const op3: any = [2, '___', 5, {d: 3}, '..', {d: 2}, 3, '------', {d: 3}, 3, {d: 2}, 1, {d: 1}, 25, '~~~~', {d: 4}];

const delta = d.create(str);
const deltaOp = d.opToDelta(op1);
const res = d.apply(delta, d.deserialize(deltaOp));

console.log(apply(str, op1));
console.log(apply(str, op2));
console.log(apply2(str, op1));
console.log(type.apply(str, op3));
console.log(type2.apply(str, op3));
console.log(res.ops.reduce((acc: any, op: any) => acc + (op.insert || ''), ''));
console.log();

const suite = new Benchmark.Suite();

suite
  .add('json-joy/json-ot ot-string', () => {
    validate(op1);
    apply(str, op1);
  })
  .add('json-joy/json-ot ot-string (reversible)', () => {
    validate(op2);
    apply(str, op2);
  })
  .add('json-joy/json-ot ot-string-irreversible', () => {
    validate2(op2 as any);
    apply2(str, op2 as any);
  })
  .add('ottypes/ot-text', () => {
    type.apply(str, op3);
  })
  .add('ottypes/ot-text-unicode', () => {
    type2.apply(str, op3);
  })
  .add('quilljs/delta', () => {
    const delta = d.create(str);
    d.apply(delta, d.deserialize(deltaOp));
  })
  .on('cycle', (event: any) => {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', () => {
    console.log('Fastest is ' + suite.filter('fastest').map('name'));
  })
  .run();
