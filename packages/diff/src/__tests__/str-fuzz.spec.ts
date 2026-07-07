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
    const patch = diffEdit(src, dst, Math.floor(Math.random() * src.length));
    assertPatch(src, dst, patch);
  }
});

test('fuzzing fast-diff', () => {
  for (let i = 0; i < iterations; i++) {
    const src = str();
    const dst = str();
    const patch = fastDiff(src, dst);
    assertPatch(src, dst, patch);
  }
});
