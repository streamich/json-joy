import {toBuf} from '@jsonjoy.com/buffers/lib/toBuf';
import {RandomJson} from '@jsonjoy.com/json-random';
import * as bin from '../bin';
import {int, logSeed} from './rnd';
import {assertPatch} from './util';

const str = () =>
  Math.random() > 0.7 ? RandomJson.genString(Math.ceil(Math.random() * 200)) : Math.random().toString(36).slice(2);
const iterations = 100;

const assertBinPatch = (src: Uint8Array, dst: Uint8Array) => {
  const patch = bin.diff(src, dst);
  assertPatch(bin.toStr(src), bin.toStr(dst), patch);
  expect(bin.src(patch)).toEqual(src);
  expect(bin.dst(patch)).toEqual(dst);
};

test('fuzzing diff()', () => {
  for (let i = 0; i < iterations; i++) {
    assertBinPatch(toBuf(str()), toBuf(str()));
  }
});

test('fuzzing diff() with random bytes across the full 0-255 range', () => {
  const gen = (len: number): Uint8Array => {
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = int(256);
    return buf;
  };
  for (let i = 0; i < iterations; i++) {
    const src = gen(int(300));
    const dst = gen(int(300));
    try {
      assertBinPatch(src, dst);
    } catch (error) {
      logSeed({srcLen: src.length, dstLen: dst.length});
      throw error;
    }
  }
  assertBinPatch(new Uint8Array(0), new Uint8Array(0));
  assertBinPatch(new Uint8Array(0), gen(1));
  assertBinPatch(gen(1), new Uint8Array(0));
  assertBinPatch(gen(4096), gen(4096));
});
