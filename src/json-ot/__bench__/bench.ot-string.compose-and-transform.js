const Benchmark = require('benchmark');
const {validate, apply, compose, transform} = require('../../../lib/json-ot/types/ot-string');
const {
  validate: validate2,
  apply: apply2,
  compose: compose2,
  transform: transform2,
} = require('../../../lib/json-ot/types/ot-string-irreversible');
const {type} = require('ot-text');
const {type: type2} = require('ot-text-unicode');
const {delta: d} = require('./util');

const str =
  '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
const op1a = [2, '123', 5, -3, '12', -2, 3, '123456', -3, 3, -2, 1, -1];
const op1b = [7, 'asdf', 4, -3, 1, -1, 'fj', 3, -2, 1, -1, 'a'];
const op2a = [2, '123', 5, ['123'], '12', ['12'], 3, '123456', ['123'], 3, ['12'], 1, ['1']];
const op2b = [7, 'asdf', 4, ['123'], 1, ['1'], 'fj', 3, ['12'], 1, ['1'], 'a'];
const op3a = [2, '123', 5, {d: 3}, '12', {d: 2}, 3, '123456', {d: 3}, 3, {d: 2}, 1, {d: 1}];
const op3b = [7, 'asdf', 4, {d: 3}, 1, {d: 1}, 'fj', 3, {d: 2}, 1, {d: 1}, 'a'];
const op4a = d.opToDelta(op1a);
const op4b = d.opToDelta(op1b);

console.log(apply(apply(str, compose(op1a, op1b)), transform(op1a, op1b, true)));
console.log(apply2(apply2(str, compose2(op1a, op1b)), transform2(op1a, op1b, true)));
console.log(apply(apply(str, compose(op2a, op2b)), transform(op2a, op2b, true)));
console.log(type.apply(type.apply(str, type.compose(op3a, op3b)), type.transform(op3a, op3b, 'left')));
console.log(type2.apply(type2.apply(str, type2.compose(op3a, op3b)), type2.transform(op3a, op3b, 'left')));
console.log(
  d
    .apply(
      d.apply(d.create(str), d.compose(d.deserialize(op4a), d.deserialize(op4b))),
      d.transform(d.deserialize(op4a), d.deserialize(op4b)),
    )
    .reduce((str, op) => str + (op.insert || ''), ''),
);
console.log();

const suite = new Benchmark.Suite();

suite
  .add('json-joy/json-ot ot-string', () => {
    validate(op1a);
    validate(op1b);
    apply(apply(str, compose(op1a, op1b)), transform(op1a, op1b, true));
  })
  .add('json-joy/json-ot ot-string (reversible)', () => {
    validate(op2a);
    validate(op2b);
    apply(apply(str, compose(op2a, op2b)), transform(op2a, op2b, true));
  })
  .add('json-joy/json-ot ot-string-irreversible', () => {
    validate2(op1a);
    validate2(op1b);
    apply2(apply2(str, compose2(op1a, op1b)), transform2(op1a, op1b, true));
  })
  .add('ottypes/ot-text', () => {
    type.apply(type.apply(str, type.compose(op3a, op3b)), type.transform(op3a, op3b, 'left'));
  })
  .add('ottypes/ot-text-unicode', () => {
    type2.apply(type2.apply(str, type2.compose(op3a, op3b)), type2.transform(op3a, op3b, 'left'));
  })
  .add('quilljs/delta', () => {
    d.serialize(
      d.apply(
        d.apply(d.create(str), d.compose(d.deserialize(op4a), d.deserialize(op4b))),
        d.transform(d.deserialize(op4a), d.deserialize(op4b)),
      ),
    );
  })
  .on('cycle', (event) => {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
