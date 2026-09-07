import * as bin from '../bin';
import * as str from '../str';
import {assertDiff} from './line';
import {assertPatch, slow} from './util';

/**
 * The 10KB pair below is the size-scaling point of the 4KB one above and costs
 * two seconds to make it, so it is opt-in rather than merely CI-skipped.
 */
const testSlow: typeof test = slow ? test : test.skip;

test('large text with a small edit stays small and fast', () => {
  const src = 'lorem ipsum dolor sit amet '.repeat(20000);
  const dst = src.slice(0, 250000) + 'XYZ' + src.slice(250010);
  const patch = str.diff(src, dst);
  assertPatch(src, dst, patch);
  let editVolume = 0;
  for (const [type, txt] of patch) if (type !== str.PATCH_OP_TYPE.EQL) editVolume += txt.length;
  expect(editVolume).toBeLessThan(100);
});

test('pathological alternating pattern', () => {
  const src = 'ab'.repeat(3000);
  const dst = 'ba'.repeat(3000);
  assertPatch(src, dst, str.diff(src, dst));
});

test('two unrelated 4KB strings', () => {
  let src = '';
  let dst = '';
  for (let i = 0; i < 4000; i++) {
    src += String.fromCharCode(97 + ((i * 7) % 13));
    dst += String.fromCharCode(110 + ((i * 11) % 13));
  }
  assertPatch(src, dst, str.diff(src, dst));
});

testSlow(
  'two unrelated 10KB strings',
  () => {
    let src = '';
    let dst = '';
    for (let i = 0; i < 10000; i++) {
      src += String.fromCharCode(97 + ((i * 7) % 13));
      dst += String.fromCharCode(110 + ((i * 11) % 13));
    }
    assertPatch(src, dst, str.diff(src, dst));
  },
  30000,
);

test('many lines with edits and a moved block', () => {
  const lines = slow ? 10000 : 3000;
  const at = (fraction: number) => Math.round(lines * fraction);
  const src: string[] = [];
  for (let i = 0; i < lines; i++) src.push('line ' + (i % 700));
  const dst = [...src];
  dst.splice(at(0.02), 3);
  dst.splice(at(0.5), 0, 'inserted A', 'inserted B');
  const block = dst.splice(at(0.1), 50);
  dst.splice(at(0.8), 0, ...block);
  dst[at(0.3)] = dst[at(0.3)] + ' modified';
  assertDiff(src, dst);
});

test('large binary buffer with a small mutation', () => {
  const src = new Uint8Array(slow ? 1 << 20 : 1 << 18);
  for (let i = 0; i < src.length; i++) src[i] = (i * 31) & 0xff;
  const dst = src.slice();
  dst[src.length >> 1] ^= 0xff;
  dst[(src.length >> 1) + 1] ^= 0xff;
  const patch = bin.diff(src, dst);
  expect(bin.src(patch)).toEqual(src);
  expect(bin.dst(patch)).toEqual(dst);
  expect(patch.length).toBeLessThan(10);
});
