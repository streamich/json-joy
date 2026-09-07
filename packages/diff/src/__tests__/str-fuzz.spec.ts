import {RandomJson} from '@jsonjoy.com/json-random';
import {assertPatch} from './util';
import {diff, diffEdit} from '../str';
const fastDiff = require('fast-diff') as typeof diff;

const str = () =>
  Math.random() > 0.7 ? RandomJson.genString(Math.ceil(Math.random() * 200)) : Math.random().toString(36).slice(2);
const iterations = 100;

test('fuzzing diff()', () => {
  for (let i = 0; i < iterations; i++) {
    const src = str();
    const dst = str();
    const patch = diff(src, dst);
    assertPatch(src, dst, patch);
  }
});

test('fuzzing diffEdit()', () => {
  for (let i = 0; i < iterations; i++) {
    const src = str();
    const dst = str();
    // Caret is a position in `dst`, `dst.length` (append at end) included.
    const caret = Math.floor(Math.random() * (dst.length + 1));
    const patch = diffEdit(src, dst, caret);
    assertPatch(src, dst, patch);
  }
});

// A caret between the two halves of a surrogate pair is rounded down to the
// pair boundary, so ops stay well-formed. Not reachable by the fuzzers above,
// because their generator never emits surrogates.
test('diffEdit() caret inside a surrogate pair emits well-formed ops', () => {
  const src = '👨‍🍳';
  const dst = '🙃👨‍🍳';
  assertPatch(src, dst, diffEdit(src, dst, 3));
});

test('fuzzing fast-diff', () => {
  for (let i = 0; i < iterations; i++) {
    const src = str();
    const dst = str();
    const patch = fastDiff(src, dst);
    assertPatch(src, dst, patch);
  }
});
