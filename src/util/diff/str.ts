/**
 * This is a port of diff-patch-match to TypeScript.
 */

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
 * @param fix_unicode Whether to normalize to a unicode-correct diff
 */
const cleanupMerge = (diff: Patch, fix_unicode: boolean) => {
  diff.push([PATCH_OP_TYPE.EQUAL, '']);
  let pointer = 0;
  let count_delete = 0;
  let count_insert = 0;
  let text_delete = '';
  let text_insert = '';
  let commonLength: number = 0;
  while (pointer < diff.length) {
    if (pointer < diff.length - 1 && !diff[pointer][1]) {
      diff.splice(pointer, 1);
      continue;
    }
    switch (diff[pointer][0]) {
      case PATCH_OP_TYPE.INSERT:
        count_insert++;
        text_insert += diff[pointer][1];
        pointer++;
        break;
      case PATCH_OP_TYPE.DELETE:
        count_delete++;
        text_delete += diff[pointer][1];
        pointer++;
        break;
      case PATCH_OP_TYPE.EQUAL: {
        let previous_equality = pointer - count_insert - count_delete - 1;
        if (fix_unicode) {
          // prevent splitting of unicode surrogate pairs.  when fix_unicode is true,
          // we assume that the old and new text in the diff are complete and correct
          // unicode-encoded JS strings, but the tuple boundaries may fall between
          // surrogate pairs.  we fix this by shaving off stray surrogates from the end
          // of the previous equality and the beginning of this equality.  this may create
          // empty equalities or a common prefix or suffix.  for example, if AB and AC are
          // emojis, `[[0, 'A'], [-1, 'BA'], [0, 'C']]` would turn into deleting 'ABAC' and
          // inserting 'AC', and then the common suffix 'AC' will be eliminated.  in this
          // particular case, both equalities go away, we absorb any previous inequalities,
          // and we keep scanning for the next equality before rewriting the tuples.
          if (previous_equality >= 0 && endsWithPairStart(diff[previous_equality][1])) {
            const stray = diff[previous_equality][1].slice(-1);
            diff[previous_equality][1] = diff[previous_equality][1].slice(0, -1);
            text_delete = stray + text_delete;
            text_insert = stray + text_insert;
            if (!diff[previous_equality][1]) {
              // emptied out previous equality, so delete it and include previous delete/insert
              diff.splice(previous_equality, 1);
              pointer--;
              let k = previous_equality - 1;
              if (diff[k] && diff[k][0] === PATCH_OP_TYPE.INSERT) {
                count_insert++;
                text_insert = diff[k][1] + text_insert;
                k--;
              }
              if (diff[k] && diff[k][0] === PATCH_OP_TYPE.DELETE) {
                count_delete++;
                text_delete = diff[k][1] + text_delete;
                k--;
              }
              previous_equality = k;
            }
          }
          if (startsWithPairEnd(diff[pointer][1])) {
            const stray = diff[pointer][1].charAt(0);
            diff[pointer][1] = diff[pointer][1].slice(1);
            text_delete += stray;
            text_insert += stray;
          }
        }
        if (pointer < diff.length - 1 && !diff[pointer][1]) {
          // for empty equality not at end, wait for next equality
          diff.splice(pointer, 1);
          break;
        }
        if (text_delete.length > 0 || text_insert.length > 0) {
          // note that diff_commonPrefix and diff_commonSuffix are unicode-aware
          if (text_delete.length > 0 && text_insert.length > 0) {
            // Factor out any common prefixes.
            commonLength = pfx(text_insert, text_delete);
            if (commonLength !== 0) {
              if (previous_equality >= 0) {
                diff[previous_equality][1] += text_insert.substring(0, commonLength);
              } else {
                diff.splice(0, 0, [PATCH_OP_TYPE.EQUAL, text_insert.substring(0, commonLength)]);
                pointer++;
              }
              text_insert = text_insert.substring(commonLength);
              text_delete = text_delete.substring(commonLength);
            }
            // Factor out any common suffixes.
            commonLength = sfx(text_insert, text_delete);
            if (commonLength !== 0) {
              diff[pointer][1] = text_insert.substring(text_insert.length - commonLength) + diff[pointer][1];
              text_insert = text_insert.substring(0, text_insert.length - commonLength);
              text_delete = text_delete.substring(0, text_delete.length - commonLength);
            }
          }
          // Delete the offending records and add the merged ones.
          const n = count_insert + count_delete;
          if (text_delete.length === 0 && text_insert.length === 0) {
            diff.splice(pointer - n, n);
            pointer = pointer - n;
          } else if (text_delete.length === 0) {
            diff.splice(pointer - n, n, [PATCH_OP_TYPE.INSERT, text_insert]);
            pointer = pointer - n + 1;
          } else if (text_insert.length === 0) {
            diff.splice(pointer - n, n, [PATCH_OP_TYPE.DELETE, text_delete]);
            pointer = pointer - n + 1;
          } else {
            diff.splice(pointer - n, n, [PATCH_OP_TYPE.DELETE, text_delete], [PATCH_OP_TYPE.INSERT, text_insert]);
            pointer = pointer - n + 2;
          }
        }
        if (pointer !== 0 && diff[pointer - 1][0] === PATCH_OP_TYPE.EQUAL) {
          // Merge this equality with the previous one.
          diff[pointer - 1][1] += diff[pointer][1];
          diff.splice(pointer, 1);
        } else {
          pointer++;
        }
        count_insert = 0;
        count_delete = 0;
        text_delete = '';
        text_insert = '';
        break;
      }
    }
  }
  if (diff[diff.length - 1][1] === '') {
    diff.pop(); // Remove the dummy entry at the end.
  }

  // Second pass: look for single edits surrounded on both sides by equalities
  // which can be shifted sideways to eliminate an equality.
  // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
  let changes = false;
  pointer = 1;
  // Intentionally ignore the first and last element (don't need checking).
  while (pointer < diff.length - 1) {
    if (diff[pointer - 1][0] === PATCH_OP_TYPE.EQUAL && diff[pointer + 1][0] === PATCH_OP_TYPE.EQUAL) {
      // This is a single edit surrounded by equalities.
      if (diff[pointer][1].substring(diff[pointer][1].length - diff[pointer - 1][1].length) === diff[pointer - 1][1]) {
        // Shift the edit over the previous equality.
        diff[pointer][1] =
          diff[pointer - 1][1] + diff[pointer][1].substring(0, diff[pointer][1].length - diff[pointer - 1][1].length);
        diff[pointer + 1][1] = diff[pointer - 1][1] + diff[pointer + 1][1];
        diff.splice(pointer - 1, 1);
        changes = true;
      } else if (diff[pointer][1].substring(0, diff[pointer + 1][1].length) === diff[pointer + 1][1]) {
        // Shift the edit over the next equality.
        diff[pointer - 1][1] += diff[pointer + 1][1];
        diff[pointer][1] = diff[pointer][1].substring(diff[pointer + 1][1].length) + diff[pointer + 1][1];
        diff.splice(pointer + 1, 1);
        changes = true;
      }
    }
    pointer++;
  }
  // If shifts were made, the diff needs reordering and another shift sweep.
  if (changes) cleanupMerge(diff, fix_unicode);
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
  const diffsA = diff_(text1.substring(0, x), text2.substring(0, y), false);
  const diffsB = diff_(text1.substring(x), text2.substring(y), false);
  return diffsA.concat(diffsB);
};

/**
 * Find the 'middle snake' of a diff, split the problem in two
 * and return the recursively constructed diff.
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
      if (k1 === -d || (k1 !== d && v1[k1_offset - 1] < v1[k1_offset + 1])) x1 = v1[k1_offset + 1];
      else x1 = v1[k1_offset - 1] + 1;
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
        if (k2Offset >= 0 && k2Offset < vLength && v2[k2Offset] !== -1) {
          if (x1 >= text1Length - v2[k2Offset]) return bisectSplit(text1, text2, x1, y1);
        }
      }
    }
    // Walk the reverse path one step.
    for (let k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      const k2_offset = vOffset + k2;
      let x2: number = 0;
      if (k2 === -d || (k2 !== d && v2[k2_offset - 1] < v2[k2_offset + 1])) x2 = v2[k2_offset + 1];
      else x2 = v2[k2_offset - 1] + 1;
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
        if (k1_offset >= 0 && k1_offset < vLength && v1[k1_offset] !== -1) {
          const x1 = v1[k1_offset];
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
    const start = long.substring(0, indexOfContainedShort);
    const end = long.substring(indexOfContainedShort + shortTextLength);
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
    if (txt1.substring(start, mid) === txt2.substring(start, mid)) {
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
      txt1.substring(txt1.length - mid, txt1.length - end) ===
      txt2.substring(txt2.length - mid, txt2.length - end)
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
  const prefix = src.substring(0, prefixLength);
  src = src.substring(prefixLength);
  dst = dst.substring(prefixLength);

  // Trim off common suffix (speedup).
  const suffixLength = sfx(src, dst);
  const suffix = src.substring(src.length - suffixLength);
  src = src.substring(0, src.length - suffixLength);
  dst = dst.substring(0, dst.length - suffixLength);

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
    switch (op[0]) {
      case PATCH_OP_TYPE.EQUAL:
      case PATCH_OP_TYPE.DELETE:
        txt += op[1];
        break;
    }
  }
  return txt;
};

export const dst = (patch: Patch): string => {
  let txt = '';
  const length = patch.length;
  for (let i = 0; i < length; i++) {
    const op = patch[i];
    switch (op[0]) {
      case PATCH_OP_TYPE.EQUAL:
      case PATCH_OP_TYPE.INSERT:
        txt += op[1];
        break;
    }
  }
  return txt;
};

export const invertOp = (op: PatchOperation): PatchOperation => {
  switch (op[0]) {
    case PATCH_OP_TYPE.EQUAL:
      return op;
    case PATCH_OP_TYPE.INSERT:
      return [PATCH_OP_TYPE.DELETE, op[1]];
    case PATCH_OP_TYPE.DELETE:
      return [PATCH_OP_TYPE.INSERT, op[1]];
  }
};

export const invert = (patch: Patch): Patch => {
  const inverted: Patch = [];
  const length = patch.length;
  for (let i = 0; i < length; i++) inverted.push(invertOp(patch[i]));
  return inverted;
};

export const apply = (patch: Patch, onInsert: (pos: number, str: string) => void, onDelete: (pos: number, len: number) => void) => {
  const length = patch.length;
  let pos = 0;
  for (let i = 0; i < length; i++) {
    const op = patch[i];
    switch (op[0]) {
      case PATCH_OP_TYPE.EQUAL:
        pos += op[1].length;
        break;
      case PATCH_OP_TYPE.INSERT:
        const txt = op[1];
        onInsert(pos, txt);
        pos += txt.length;
        break;
      case PATCH_OP_TYPE.DELETE:
        onDelete(pos, op[1].length);
        break;
    }
  }
};
