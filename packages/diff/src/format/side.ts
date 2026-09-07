import type {LinePatch} from '../line';
import {paint} from './colors';
import {groups as toGroups} from './groups';
import {type ColorOptions, type Group, GROUP_TYPE, type SideOptions} from './types';

const GUTTER = 3;
const WIDTH = 130;
const TAB = 8;

/**
 * Where the two columns sit, which is the whole of the side-by-side layout.
 */
const geometry = (width: number, tabSize: number, expandTabs: boolean): [half: number, column2: number] => {
  const t = expandTabs ? 1 : tabSize;
  const gap = t + GUTTER;
  const unaligned = (width >> 1) + (gap >> 1) + (width & gap & 1);
  const off = unaligned - (unaligned % t);
  const half = Math.max(0, Math.min(off - GUTTER, width - off));
  return [half, half ? off : width];
};

const printable = (code: number): boolean => code >= 0x20 && code <= 0x7e;

const pad = (from: number, to: number, tabSize: number, expandTabs: boolean): string => {
  let out = '';
  if (!expandTabs)
    for (let tab = from + tabSize - (from % tabSize); tab <= to; tab += tabSize) {
      out += '\t';
      from = tab;
    }
  while (from++ < to) out += ' ';
  return out;
};

const half = (
  str: string,
  ind: number,
  bound: number,
  tabSize: number,
  expandTabs: boolean,
): [out: string, column: number] => {
  const length = str.length;
  let out = '';
  let inPos = 0;
  let outPos = 0;
  for (let i = 0; i < length; i++) {
    const c = str[i];
    const code = str.charCodeAt(i);
    if (code === 0x09) {
      const stop = inPos + tabSize - (inPos % tabSize);
      if (inPos === outPos) {
        if (expandTabs) {
          const to = bound < stop ? bound : stop;
          for (; outPos < to; outPos++) out += ' ';
        } else if (stop < bound) {
          outPos = stop;
          out += c;
        }
      }
      inPos = stop;
      continue;
    }
    if (code === 0x0d) {
      out += c + pad(0, ind, tabSize, expandTabs);
      inPos = outPos = 0;
      continue;
    }
    if (code === 0x08) {
      if (inPos !== 0 && --inPos < bound) {
        if (outPos <= inPos) for (; outPos < inPos; outPos++) out += ' ';
        else {
          outPos = inPos;
          out += c;
        }
      }
      continue;
    }
    if (printable(code)) inPos++;
    if (inPos <= bound) {
      if (printable(code)) outPos = inPos;
      out += c;
    }
  }
  return [out, outPos];
};

/**
 * Renders {@link groups} as a side-by-side diff, `diff -y`.
 *
 * @param groups The whole-file tiling, from {@link groups}.
 * @param src Source lines, no terminators.
 * @param dst Destination lines, no terminators.
 * @param options Printing options.
 * @returns Diff chunks, one per line.
 */
export function* sideBySideGroups(
  groups: Group[],
  src: string[],
  dst: string[],
  options?: SideOptions,
): Generator<string> {
  const expandTabs = !!options?.expandTabs;
  const tabSize = options?.tabSize || TAB;
  const [hw, c2o] = geometry(options?.width || WIDTH, tabSize, expandTabs);
  const gutter = (hw + c2o - 1) >> 1;
  const colors = options?.colors;
  const reset = colors?.reset ?? '';
  const leftColumn = !!options?.leftColumn;
  const suppress = !!options?.suppressCommonLines;
  const assist = !!options?.mergeAssist;
  const srcLast = options?.srcNoEol ? src.length - 1 : -1;
  const dstLast = options?.dstNoEol ? dst.length - 1 : -1;
  const row = (left: number, sep: string, right: number): string => {
    let out = '';
    let col = 0;
    let newline = false;
    if (left >= 0) {
      newline ||= left !== srcLast;
      const [text, reached] = half(src[left], 0, hw, tabSize, expandTabs);
      out += text;
      col = reached;
    }
    if (sep !== ' ') {
      out += pad(col, gutter, tabSize, expandTabs);
      col = gutter + 1;
      if (sep === '|' && newline !== (right !== dstLast)) sep = newline ? '/' : '\\';
      out += sep;
    }
    if (right >= 0) {
      newline ||= right !== dstLast;
      if (dst[right] !== '') {
        out += pad(col, c2o, tabSize, expandTabs);
        out += half(dst[right], c2o, hw, tabSize, expandTabs)[0];
      }
    }
    if (newline) out += '\n';
    return sep === '<' || sep === '>' ? paint(sep === '<' ? colors?.del : colors?.add, out, reset) : out;
  };
  for (const group of groups) {
    const {srcFrom, srcUpto, dstFrom, dstUpto} = group;
    if (group.type === GROUP_TYPE.UNCHANGED) {
      if (suppress || (srcFrom === srcUpto && dstFrom === dstUpto)) continue;
      if (assist) yield `i${srcUpto - srcFrom},${dstUpto - dstFrom}\n`;
      let i = srcFrom;
      let j = dstFrom;
      if (!leftColumn) {
        for (; i < srcUpto && j < dstUpto; i++, j++) yield row(i, ' ', j);
        for (; j < dstUpto; j++) yield row(-1, ')', j);
      }
      for (; i < srcUpto; i++) yield row(i, '(', -1);
      continue;
    }
    if (assist) yield `c${srcUpto - srcFrom},${dstUpto - dstFrom}\n`;
    let i = srcFrom;
    let j = dstFrom;
    for (; i < srcUpto && j < dstUpto; i++, j++) yield row(i, '|', j);
    for (let k = j; k < dstUpto; k++) yield row(-1, '>', k);
    for (let k = i; k < srcUpto; k++) yield row(k, '<', -1);
  }
}

/**
 * Serializes a line patch as a side-by-side diff, `diff -y`, in chunks.
 *
 * @param src Source lines, no terminators.
 * @param dst Destination lines, no terminators.
 * @param patch Patch, from `lines.diff` or `line.diff`
 * @param options Serialization options.
 * @returns Diff chunks, one line each.
 */
export function* sideBySide(
  src: string[],
  dst: string[],
  patch: LinePatch,
  options?: SideOptions & ColorOptions,
): Generator<string> {
  yield* sideBySideGroups(toGroups(patch, options), src, dst, options);
}
