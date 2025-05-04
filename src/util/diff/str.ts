export const enum PATCH_OP_TYPE {
  DELETE = -1,
  EQUAL = 0,
  INSERT = 1,
}

export type Patch = PatchOperation[];
export type PatchOperation = PatchOperationDelete | PatchOperationEqual | PatchOperationInsert;
export type PatchOperationDelete = [PATCH_OP_TYPE.DELETE, string];
export type PatchOperationEqual = [PATCH_OP_TYPE.EQUAL, string];
export type PatchOperationInsert = [PATCH_OP_TYPE.INSERT, string];

const startsWithPairEnd = (str: string) => {
  const code = str.charCodeAt(0);
  return code >= 0xdc00 && code <= 0xdfff;
};

const endsWithPairStart = (str: string): boolean => {
  const code = str.charCodeAt(str.length - 1);
  return code >= 0xd800 && code <= 0xdbff;
};

/**
 * Reorder and merge like edit sections. Merge equalities.
 * Any edit section can move as long as it doesn't cross an equality.
 *
 * @param diff Array of diff tuples.
 * @param fixUnicode Whether to normalize to a unicode-correct diff
 */
const cleanupMerge = (diff: Patch, fixUnicode: boolean) => {
  diff.push([PATCH_OP_TYPE.EQUAL, '']);
  let pointer = 0;
  let delCnt = 0;
  let insCnt = 0;
  let delTxt = '';
  let insTxt = '';
  let commonLength: number = 0;
  while (pointer < diff.length) {
    if (pointer < diff.length - 1 && !diff[pointer][1]) {
      diff.splice(pointer, 1);
      continue;
    }
    const d1 = diff[pointer];
    switch (d1[0]) {
      case PATCH_OP_TYPE.INSERT:
        insCnt++;
        pointer++;
        insTxt += d1[1];
        break;
      case PATCH_OP_TYPE.DELETE:
        delCnt++;
        pointer++;
        delTxt += d1[1];
        break;
      case PATCH_OP_TYPE.EQUAL: {
        let prevEq = pointer - insCnt - delCnt - 1;
        if (fixUnicode) {
          // prevent splitting of unicode surrogate pairs. When `fixUnicode` is true,
          // we assume that the old and new text in the diff are complete and correct
          // unicode-encoded JS strings, but the tuple boundaries may fall between
          // surrogate pairs. We fix this by shaving off stray surrogates from the end
          // of the previous equality and the beginning of this equality. This may create
          // empty equalities or a common prefix or suffix. For example, if AB and AC are
          // emojis, `[[0, 'A'], [-1, 'BA'], [0, 'C']]` would turn into deleting 'ABAC' and
          // inserting 'AC', and then the common suffix 'AC' will be eliminated.  in this
          // particular case, both equalities go away, we absorb any previous inequalities,
          // and we keep scanning for the next equality before rewriting the tuples.
          const d = diff[prevEq];
          if (prevEq >= 0) {
            let str = d[1];
            if (endsWithPairStart(str)) {
              const stray = str.slice(-1);
              d[1] = str = str.slice(0, -1);
              delTxt = stray + delTxt;
              insTxt = stray + insTxt;
              if (!str) {
                // emptied out previous equality, so delete it and include previous delete/insert
                diff.splice(prevEq, 1);
                pointer--;
                let k = prevEq - 1;
                const dk = diff[k];
                if (dk) {
                  const type = dk[0];
                  if (type === PATCH_OP_TYPE.INSERT) {
                    insCnt++;
                    k--;
                    insTxt = dk[1] + insTxt;
                  } else if (type === PATCH_OP_TYPE.DELETE) {
                    delCnt++;
                    k--;
                    delTxt = dk[1] + delTxt;
                  }
                }
                prevEq = k;
              }
            }
          }
          const d1 = diff[pointer];
          const str1 = d1[1];
          if (startsWithPairEnd(str1)) {
            const stray = str1.charAt(0);
            d1[1] = str1.slice(1);
            delTxt += stray;
            insTxt += stray;
          }
        }
        if (pointer < diff.length - 1 && !diff[pointer][1]) {
          // for empty equality not at end, wait for next equality
          diff.splice(pointer, 1);
          break;
        }
        const hasDelTxt = delTxt.length > 0;
        const hasInsTxt = insTxt.length > 0;
        if (hasDelTxt || hasInsTxt) {
          // note that diff_commonPrefix and diff_commonSuffix are unicode-aware
          if (hasDelTxt && hasInsTxt) {
            // Factor out any common prefixes.
            commonLength = pfx(insTxt, delTxt);
            if (commonLength !== 0) {
              if (prevEq >= 0) {
                diff[prevEq][1] += insTxt.slice(0, commonLength);
              } else {
                diff.splice(0, 0, [PATCH_OP_TYPE.EQUAL, insTxt.slice(0, commonLength)]);
                pointer++;
              }
              insTxt = insTxt.slice(commonLength);
              delTxt = delTxt.slice(commonLength);
            }
            // Factor out any common suffixes.
            commonLength = sfx(insTxt, delTxt);
            if (commonLength !== 0) {
              diff[pointer][1] = insTxt.slice(insTxt.length - commonLength) + diff[pointer][1];
              insTxt = insTxt.slice(0, insTxt.length - commonLength);
              delTxt = delTxt.slice(0, delTxt.length - commonLength);
            }
          }
          // Delete the offending records and add the merged ones.
          const n = insCnt + delCnt;
          const delTxtLen = delTxt.length;
          const insTxtLen = insTxt.length;
          if (delTxtLen === 0 && insTxtLen === 0) {
            diff.splice(pointer - n, n);
            pointer = pointer - n;
          } else if (delTxtLen === 0) {
            diff.splice(pointer - n, n, [PATCH_OP_TYPE.INSERT, insTxt]);
            pointer = pointer - n + 1;
          } else if (insTxtLen === 0) {
            diff.splice(pointer - n, n, [PATCH_OP_TYPE.DELETE, delTxt]);
            pointer = pointer - n + 1;
          } else {
            diff.splice(pointer - n, n, [PATCH_OP_TYPE.DELETE, delTxt], [PATCH_OP_TYPE.INSERT, insTxt]);
            pointer = pointer - n + 2;
          }
        }
        const d0 = diff[pointer - 1];
        if (pointer !== 0 && d0[0] === PATCH_OP_TYPE.EQUAL) {
          // Merge this equality with the previous one.
          d0[1] += diff[pointer][1];
          diff.splice(pointer, 1);
        } else pointer++;
        insCnt = 0;
        delCnt = 0;
        delTxt = '';
        insTxt = '';
        break;
      }
    }
  }
  if (diff[diff.length - 1][1] === '') diff.pop(); // Remove the dummy entry at the end.

  // Second pass: look for single edits surrounded on both sides by equalities
  // which can be shifted sideways to eliminate an equality.
  // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
  let changes = false;
  pointer = 1;
  // Intentionally ignore the first and last element (don't need checking).
  while (pointer < diff.length - 1) {
    const d0 = diff[pointer - 1];
    const d2 = diff[pointer + 1];
    if (d0[0] === PATCH_OP_TYPE.EQUAL && d2[0] === PATCH_OP_TYPE.EQUAL) {
      // This is a single edit surrounded by equalities.
      const str0 = d0[1];
      const d1 = diff[pointer];
      const str1 = d1[1];
      const str2 = d2[1];
      if (str1.slice(str1.length - str0.length) === str0) {
        // Shift the edit over the previous equality.
        diff[pointer][1] = str0 + str1.slice(0, str1.length - str0.length);
        d2[1] = str0 + str2;
        diff.splice(pointer - 1, 1);
        changes = true;
      } else if (str1.slice(0, str2.length) === str2) {
        // Shift the edit over the next equality.
        d0[1] += d2[1];
        d1[1] = str1.slice(str2.length) + str2;
        diff.splice(pointer + 1, 1);
        changes = true;
      }
    }
    pointer++;
  }
  // If shifts were made, the diff needs reordering and another shift sweep.
  if (changes) cleanupMerge(diff, fixUnicode);
};

/**
 * Given the location of the 'middle snake', split the diff in two parts
 * and recurse.
 *
 * @param text1 Old string to be diffed.
 * @param text2 New string to be diffed.
 * @param x Index of split point in text1.
 * @param y Index of split point in text2.
 * @return Array of diff tuples.
 */
const bisectSplit = (text1: string, text2: string, x: number, y: number): Patch => {
  const diffsA = diff_(text1.slice(0, x), text2.slice(0, y), false);
  const diffsB = diff_(text1.slice(x), text2.slice(y), false);
  return diffsA.concat(diffsB);
};

/**
 * Find the 'middle snake' of a diff, split the problem in two
 * and return the recursively constructed diff.
 * 
 * This is a port of `diff-patch-match` implementation to TypeScript.
 *
 * @see http://www.xmailserver.org/diff2.pdf EUGENE W. MYERS 1986 paper: An
 *     O(ND) Difference Algorithm and Its Variations.
 *
 * @param text1 Old string to be diffed.
 * @param text2 New string to be diffed.
 * @return A {@link Patch} - an array of patch operations.
 */
const bisect = (text1: string, text2: string): Patch => {
  const text1Length = text1.length;
  const text2Length = text2.length;
  const maxD = Math.ceil((text1Length + text2Length) / 2);
  const vOffset = maxD;
  const vLength = 2 * maxD;
  const v1 = new Array(vLength);
  const v2 = new Array(vLength);
  for (let x = 0; x < vLength; x++) {
    v1[x] = -1;
    v2[x] = -1;
  }
  v1[vOffset + 1] = 0;
  v2[vOffset + 1] = 0;
  const delta = text1Length - text2Length;
  // If the total number of characters is odd, then the front path will collide
  // with the reverse path.
  const front = delta % 2 !== 0;
  // Offsets for start and end of k loop.
  // Prevents mapping of space beyond the grid.
  let k1start = 0;
  let k1end = 0;
  let k2start = 0;
  let k2end = 0;
  for (let d = 0; d < maxD; d++) {
    for (let k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
      const k1_offset = vOffset + k1;
      let x1: number = 0;
      const v10 = v1[k1_offset - 1];
      const v11 = v1[k1_offset + 1];
      if (k1 === -d || (k1 !== d && v10 < v11)) x1 = v11;
      else x1 = v10 + 1;
      let y1 = x1 - k1;
      while (x1 < text1Length && y1 < text2Length && text1.charAt(x1) === text2.charAt(y1)) {
        x1++;
        y1++;
      }
      v1[k1_offset] = x1;
      if (x1 > text1Length) k1end += 2;
      else if (y1 > text2Length) k1start += 2;
      else if (front) {
        const k2Offset = vOffset + delta - k1;
        const v2Offset = v2[k2Offset];
        if (k2Offset >= 0 && k2Offset < vLength && v2Offset !== -1) {
          if (x1 >= text1Length - v2Offset) return bisectSplit(text1, text2, x1, y1);
        }
      }
    }
    // Walk the reverse path one step.
    for (let k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      const k2_offset = vOffset + k2;
      let x2 = k2 === -d || (k2 !== d && v2[k2_offset - 1] < v2[k2_offset + 1]) ? v2[k2_offset + 1] : v2[k2_offset - 1] + 1;
      let y2 = x2 - k2;
      while (
        x2 < text1Length &&
        y2 < text2Length &&
        text1.charAt(text1Length - x2 - 1) === text2.charAt(text2Length - y2 - 1)
      ) {
        x2++;
        y2++;
      }
      v2[k2_offset] = x2;
      if (x2 > text1Length) k2end += 2;
      else if (y2 > text2Length) k2start += 2;
      else if (!front) {
        const k1_offset = vOffset + delta - k2;
        const x1 = v1[k1_offset];
        if (k1_offset >= 0 && k1_offset < vLength && x1 !== -1) {
          const y1 = vOffset + x1 - k1_offset;
          x2 = text1Length - x2;
          if (x1 >= x2) return bisectSplit(text1, text2, x1, y1);
        }
      }
    }
  }
  return [
    [PATCH_OP_TYPE.DELETE, text1],
    [PATCH_OP_TYPE.INSERT, text2],
  ];
};

/**
 * Find the differences between two texts. Assumes that the texts do not
 * have any common prefix or suffix.
 *
 * @param src Old string to be diffed.
 * @param dst New string to be diffed.
 * @return A {@link Patch} - an array of patch operations.
 */
const diffNoCommonAffix = (src: string, dst: string): Patch => {
  if (!src) return [[PATCH_OP_TYPE.INSERT, dst]];
  if (!dst) return [[PATCH_OP_TYPE.DELETE, src]];
  const text1Length = src.length;
  const text2Length = dst.length;
  const long = text1Length > text2Length ? src : dst;
  const short = text1Length > text2Length ? dst : src;
  const shortTextLength = short.length;
  const indexOfContainedShort = long.indexOf(short);
  if (indexOfContainedShort >= 0) {
    const start = long.slice(0, indexOfContainedShort);
    const end = long.slice(indexOfContainedShort + shortTextLength);
    return text1Length > text2Length
      ? [
          [PATCH_OP_TYPE.DELETE, start],
          [PATCH_OP_TYPE.EQUAL, short],
          [PATCH_OP_TYPE.DELETE, end],
        ]
      : [
          [PATCH_OP_TYPE.INSERT, start],
          [PATCH_OP_TYPE.EQUAL, short],
          [PATCH_OP_TYPE.INSERT, end],
        ];
  }
  if (shortTextLength === 1)
    return [
      [PATCH_OP_TYPE.DELETE, src],
      [PATCH_OP_TYPE.INSERT, dst],
    ];
  return bisect(src, dst);
};

/**
 * Determine the common prefix of two strings.
 *
 * @param txt1 First string.
 * @param txt2 Second string.
 * @return The number of characters common to the start of each string.
 */
export const pfx = (txt1: string, txt2: string) => {
  if (!txt1 || !txt2 || txt1.charAt(0) !== txt2.charAt(0)) return 0;
  let min = 0;
  let max = Math.min(txt1.length, txt2.length);
  let mid = max;
  let start = 0;
  while (min < mid) {
    if (txt1.slice(start, mid) === txt2.slice(start, mid)) {
      min = mid;
      start = min;
    } else max = mid;
    mid = Math.floor((max - min) / 2 + min);
  }
  const code = txt1.charCodeAt(mid - 1);
  const isSurrogatePairStart = code >= 0xd800 && code <= 0xdbff;
  if (isSurrogatePairStart) mid--;
  return mid;
};

/**
 * Determine the common suffix of two strings.
 *
 * @param txt1 First string.
 * @param txt2 Second string.
 * @return The number of characters common to the end of each string.
 */
export const sfx = (txt1: string, txt2: string): number => {
  if (!txt1 || !txt2 || txt1.slice(-1) !== txt2.slice(-1)) return 0;
  let min = 0;
  let max = Math.min(txt1.length, txt2.length);
  let mid = max;
  let end = 0;
  while (min < mid) {
    if (
      txt1.slice(txt1.length - mid, txt1.length - end) ===
      txt2.slice(txt2.length - mid, txt2.length - end)
    ) {
      min = mid;
      end = min;
    } else max = mid;
    mid = Math.floor((max - min) / 2 + min);
  }
  const code = txt1.charCodeAt(txt1.length - mid);
  const isSurrogatePairEnd = code >= 0xd800 && code <= 0xdbff;
  if (isSurrogatePairEnd) mid--;
  return mid;
};

/**
 * Find the differences between two texts. Simplifies the problem by stripping
 * any common prefix or suffix off the texts before diffing.
 *
 * @param src Old string to be diffed.
 * @param dst New string to be diffed.
 * @param cleanup Whether to apply semantic cleanup before returning.
 * @return A {@link Patch} - an array of patch operations.
 */
const diff_ = (src: string, dst: string, fixUnicode: boolean): Patch => {
  if (src === dst) return src ? [[PATCH_OP_TYPE.EQUAL, src]] : [];

  // Trim off common prefix (speedup).
  const prefixLength = pfx(src, dst);
  const prefix = src.slice(0, prefixLength);
  src = src.slice(prefixLength);
  dst = dst.slice(prefixLength);

  // Trim off common suffix (speedup).
  const suffixLength = sfx(src, dst);
  const suffix = src.slice(src.length - suffixLength);
  src = src.slice(0, src.length - suffixLength);
  dst = dst.slice(0, dst.length - suffixLength);

  // Compute the diff on the middle block.
  const diff: Patch = diffNoCommonAffix(src, dst);
  if (prefix) diff.unshift([PATCH_OP_TYPE.EQUAL, prefix]);
  if (suffix) diff.push([PATCH_OP_TYPE.EQUAL, suffix]);
  cleanupMerge(diff, fixUnicode);
  return diff;
};

/**
 * Find the differences between two texts.
 *
 * @param src Old string to be diffed.
 * @param dst New string to be diffed.
 * @return A {@link Patch} - an array of patch operations.
 */
export const diff = (src: string, dst: string): Patch => diff_(src, dst, true);

/**
 * Considers simple insertion and deletion cases around the caret position in
 * the destination string. If the fast patch cannot be constructed, it falls
 * back to the default full implementation.
 * 
 * Cases considered:
 * 
 * 1. Insertion of a single or multiple characters right before the caret.
 * 2. Deletion of one or more characters right before the caret.
 * 
 * @param src Old string to be diffed.
 * @param dst New string to be diffed.
 * @param caret The position of the caret in the new string. Set to -1 to
 *     ignore the caret position.
 * @return A {@link Patch} - an array of patch operations.
 */
export const diffEdit = (src: string, dst: string, caret: number) => {
  edit: {
    if (caret < 0) break edit;
    const srcLen = src.length;
    const dstLen = dst.length;
    if (srcLen === dstLen) break edit;
    const dstSfx = dst.slice(caret);
    const sfxLen = dstSfx.length;
    if (sfxLen > srcLen) break edit;
    const srcSfx = src.slice(srcLen - sfxLen);
    if (srcSfx !== dstSfx) break edit;
    const isInsert = dstLen > srcLen;
    if (isInsert) {
      const pfxLen = srcLen - sfxLen;
      const srcPfx = src.slice(0, pfxLen);
      const dstPfx = dst.slice(0, pfxLen);
      if (srcPfx !== dstPfx) break edit;
      const insert = dst.slice(pfxLen, caret);
      const patch: Patch = [];
      if (srcPfx) patch.push([PATCH_OP_TYPE.EQUAL, srcPfx]);
      if (insert) patch.push([PATCH_OP_TYPE.INSERT, insert]);
      if (dstSfx) patch.push([PATCH_OP_TYPE.EQUAL, dstSfx]);
      return patch;
    } else {
      const pfxLen = dstLen - sfxLen;
      const dstPfx = dst.slice(0, pfxLen);
      const srcPfx = src.slice(0, pfxLen);
      if (srcPfx !== dstPfx) break edit;
      const del = src.slice(pfxLen, srcLen - sfxLen);
      const patch: Patch = [];
      if (srcPfx) patch.push([PATCH_OP_TYPE.EQUAL, srcPfx]);
      if (del) patch.push([PATCH_OP_TYPE.DELETE, del]);
      if (dstSfx) patch.push([PATCH_OP_TYPE.EQUAL, dstSfx]);
      return patch;
    }
  }  
  return diff(src, dst);
};

export const src = (patch: Patch): string => {
  let txt = '';
  const length = patch.length;
  for (let i = 0; i < length; i++) {
    const op = patch[i];
    if (op[0] !== PATCH_OP_TYPE.INSERT) txt += op[1];
  }
  return txt;
};

export const dst = (patch: Patch): string => {
  let txt = '';
  const length = patch.length;
  for (let i = 0; i < length; i++) {
    const op = patch[i];
    if (op[0] !== PATCH_OP_TYPE.DELETE) txt += op[1];
  }
  return txt;
};

const invertOp = (op: PatchOperation): PatchOperation => {
  const type = op[0];
  return type === PATCH_OP_TYPE.EQUAL
    ? op
    : type === PATCH_OP_TYPE.INSERT
    ? [PATCH_OP_TYPE.DELETE, op[1]]
    : [PATCH_OP_TYPE.INSERT, op[1]];
};

/**
 * Inverts patch such that it can be applied to `dst` to get `src` (instead of
 * `src` to get `dst`).
 *
 * @param patch The patch to invert.
 * @returns Inverted patch.
 */
export const invert = (patch: Patch): Patch => patch.map(invertOp);

/**
 * @param patch The patch to apply.
 * @param srcLen The length of the source string.
 * @param onInsert Callback for insert operations.
 * @param onDelete Callback for delete operations.
 */
export const apply = (patch: Patch, srcLen: number, onInsert: (pos: number, str: string) => void, onDelete: (pos: number, len: number) => void) => {
  const length = patch.length;
  let pos = srcLen;
  for (let i = length - 1; i >= 0; i--) {
    const [type, str] = patch[i];
    if (type === PATCH_OP_TYPE.EQUAL) pos -= str.length;
    else if (type === PATCH_OP_TYPE.INSERT) onInsert(pos, str);
    else {
      const len = str.length;
      pos -= len;
      onDelete(pos, len);
    }
  }
};
