import {LINE_PATCH_OP_TYPE, type LinePatch} from './line';
import {normalize, overlap, PATCH_OP_TYPE, type Patch, type PatchOperation, sfx} from './str';

/**
 * Cost model for {@link coarsen}. Costs are unit-less, only ratios matter.
 */
export interface CoarsenModel {
  /** Fixed cost of an equality operation. */
  eql: number;
  /** Fixed cost of a delete operation. */
  del: number;
  /** Fixed cost of an insert operation. */
  ins: number;
  /** Cost of duplicating one equality character into the edit payloads. */
  unit: number;
}

/**
 * Trades edit volume for fewer operations. `opCost` is the per-operation
 * overhead expressed in characters of edit volume; with the default, an
 * equality flanked by full edit pairs is absorbed below 6 characters, by a
 * single edit on each side below 4, by one side only below 2.
 */
export const opCountModel = (opCost: number = 4): CoarsenModel => ({eql: opCost, del: opCost, ins: opCost, unit: 2});

/**
 * Approximates serialized patch size: each op costs `opOverhead` bytes of
 * instruction framing, each absorbed equality character costs one inserted
 * payload byte. Exact for latin-1 `bin` patches, an approximation for
 * multi-byte UTF-8 text.
 */
export const byteSizeModel = (opOverhead: number = 2): CoarsenModel => ({
  eql: opOverhead,
  del: opOverhead,
  ins: opOverhead,
  unit: 1,
});

/**
 * Coarsens a patch: absorbs equalities which cost more to keep than to
 * duplicate into the surrounding edits, producing fewer (or cheaper, per the
 * model) operations at the expense of a larger edit volume. An equality `e`
 * is absorbed when
 *
 * ```
 * eql + del * (delBefore + delAfter - 1) + ins * (insBefore + insAfter - 1) > unit * e.length
 * ```
 *
 * where the flanking terms are 0/1 flags. Reconstruction is preserved:
 * `src()` and `dst()` of the result equal those of the input. The result is
 * normalized, with each edit run canonicalized to a single DEL-then-INS pair.
 *
 * @param patch The patch to coarsen.
 * @param model Cost model, defaults to {@link opCountModel}.
 * @returns A new coarsened patch.
 */
export const coarsen = (patch: Patch, model: CoarsenModel = opCountModel()): Patch => {
  patch = normalize(patch);
  const length = patch.length;
  if (length < 2) return patch;
  // Alternating structure: eqs[i] precedes the edit run (dels[i], inss[i]).
  const eqs: string[] = [];
  const dels: string[] = [];
  const inss: string[] = [];
  let eq = '';
  let del = '';
  let ins = '';
  let inRun = false;
  for (let i = 0; i < length; i++) {
    const op = patch[i];
    const txt = op[1];
    switch (op[0]) {
      case PATCH_OP_TYPE.EQL:
        if (inRun) {
          eqs.push(eq);
          dels.push(del);
          inss.push(ins);
          eq = txt;
          del = '';
          ins = '';
          inRun = false;
        } else eq += txt;
        break;
      case PATCH_OP_TYPE.DEL:
        del += txt;
        inRun = true;
        break;
      case PATCH_OP_TYPE.INS:
        ins += txt;
        inRun = true;
        break;
    }
  }
  eqs.push(eq);
  dels.push(del);
  inss.push(ins);
  const {eql: cEql, del: cDel, ins: cIns, unit} = model;
  let i = 0;
  while (i < eqs.length) {
    const e = eqs[i];
    if (e) {
      const delB = dels[i] ? 1 : 0;
      const insB = inss[i] ? 1 : 0;
      const delA = i > 0 && dels[i - 1] ? 1 : 0;
      const insA = i > 0 && inss[i - 1] ? 1 : 0;
      const benefit = cEql + cDel * (delA + delB - 1) + cIns * (insA + insB - 1) - unit * e.length;
      if (benefit > 0) {
        if (i > 0) {
          dels[i - 1] += e + dels[i];
          inss[i - 1] += e + inss[i];
          eqs.splice(i, 1);
          dels.splice(i, 1);
          inss.splice(i, 1);
          // The previous equality's neighborhood changed, re-evaluate it.
          i--;
        } else {
          dels[0] = e + dels[0];
          inss[0] = e + inss[0];
          eqs[0] = '';
        }
        continue;
      }
    }
    i++;
  }
  const result: Patch = [];
  const count = eqs.length;
  for (let j = 0; j < count; j++) {
    if (eqs[j]) result.push([PATCH_OP_TYPE.EQL, eqs[j]]);
    if (dels[j]) result.push([PATCH_OP_TYPE.DEL, dels[j]]);
    if (inss[j]) result.push([PATCH_OP_TYPE.INS, inss[j]]);
  }
  return result;
};

const wordRegex = /[\p{L}\p{N}\p{M}]/u;
const whitespaceRegex = /\s/;
const linebreakRegex = /[\r\n\u2028\u2029]/;
const blanklineEndRegex = /\n\r?\n$/;
const blanklineStartRegex = /^\r?\n\r?\n/;

/**
 * Scores the seam between the end of `left` and the start of `right`; higher is
 * more human-meaningful. Port of diff-match-patch's semantic score, with
 * Unicode-aware (`\p{L}`) word detection instead of ASCII-only. A surrogate
 * half scores as non-word, same as the whole code point it belongs to.
 */
const seamScore = (left: string, right: string): number => {
  if (!left || !right) return 6;
  const c1 = left.charAt(left.length - 1);
  const c2 = right.charAt(0);
  const nonWord1 = !wordRegex.test(c1);
  const nonWord2 = !wordRegex.test(c2);
  const ws1 = nonWord1 && whitespaceRegex.test(c1);
  const ws2 = nonWord2 && whitespaceRegex.test(c2);
  const lineBreak1 = ws1 && linebreakRegex.test(c1);
  const lineBreak2 = ws2 && linebreakRegex.test(c2);
  const blankLine1 = lineBreak1 && blanklineEndRegex.test(left);
  const blankLine2 = lineBreak2 && blanklineStartRegex.test(right);
  if (blankLine1 || blankLine2) return 5;
  if (lineBreak1 || lineBreak2) return 4;
  if (nonWord1 && !ws1 && ws2) return 3;
  if (ws1 || ws2) return 2;
  if (nonWord1 || nonWord2) return 1;
  return 0;
};

// For well-formed content a boundary splits a surrogate pair exactly when the
// preceding text ends on a high surrogate (its low half sits after the seam).
const endsWithHighSurrogate = (str: string): boolean => {
  const code = str.charCodeAt(str.length - 1);
  return code >= 0xd800 && code <= 0xdbff;
};

const ALIGN_ROUNDS = 4;

const samePatch = (a: Patch, b: Patch): boolean => {
  const length = a.length;
  if (length !== b.length) return false;
  for (let i = 0; i < length; i++) if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) return false;
  return true;
};

const alignOnce = (patch: Patch): Patch => {
  const diff: Patch = normalize(patch).map((op) => [op[0], op[1]] as PatchOperation);
  let pointer = 1;
  while (pointer < diff.length - 1) {
    if (diff[pointer - 1][0] === PATCH_OP_TYPE.EQL && diff[pointer + 1][0] === PATCH_OP_TYPE.EQL) {
      let equality1 = diff[pointer - 1][1];
      let edit = diff[pointer][1];
      let equality2 = diff[pointer + 1][1];
      // Shift the edit as far left as possible.
      const commonOffset = sfx(equality1, edit);
      if (commonOffset) {
        const common = edit.slice(edit.length - commonOffset);
        equality1 = equality1.slice(0, equality1.length - commonOffset);
        edit = common + edit.slice(0, edit.length - commonOffset);
        equality2 = common + equality2;
      }
      // Step right, keeping the best-scoring pair-safe position.
      let bestEquality1 = equality1;
      let bestEdit = edit;
      let bestEquality2 = equality2;
      let bestScore = seamScore(equality1, edit) + seamScore(edit, equality2);
      while (equality2 && edit.charCodeAt(0) === equality2.charCodeAt(0)) {
        equality1 += edit[0];
        edit = edit.slice(1) + equality2[0];
        equality2 = equality2.slice(1);
        if (endsWithHighSurrogate(equality1) || endsWithHighSurrogate(edit)) continue;
        const score = seamScore(equality1, edit) + seamScore(edit, equality2);
        // `>=` prefers trailing over leading whitespace on the edit.
        if (score >= bestScore) {
          bestScore = score;
          bestEquality1 = equality1;
          bestEdit = edit;
          bestEquality2 = equality2;
        }
      }
      if (diff[pointer - 1][1] !== bestEquality1) {
        if (bestEquality1) diff[pointer - 1][1] = bestEquality1;
        else {
          diff.splice(pointer - 1, 1);
          pointer--;
        }
        diff[pointer][1] = bestEdit;
        if (bestEquality2) diff[pointer + 1][1] = bestEquality2;
        else {
          diff.splice(pointer + 1, 1);
          pointer--;
        }
      }
    }
    pointer++;
  }
  return canonicalMerge(diff);
};

export const align = (patch: Patch): Patch => {
  let result = alignOnce(patch);
  for (let round = 1; round < ALIGN_ROUNDS; round++) {
    const next = alignOnce(result);
    if (samePatch(next, result)) break;
    result = next;
  }
  return result;
};

// Canonicalizes edit runs (all DEL text before all INS text, adjacent same-type
// merged, empties dropped) without changing which characters are edited.
const canonicalMerge = (patch: Patch): Patch => coarsen(patch, {eql: 0, del: 0, ins: 0, unit: 1});

/**
 * Coarsens a patch toward human-meaningful hunks (diff-match-patch's semantic
 * cleanup): eliminates an equality no larger than the edits on both sides by
 * folding it into a substitution, slides the survivors onto word/line
 * boundaries via {@link align}, then factors an overlap between an adjacent
 * deletion and insertion into a shared equality when it covers at least half of
 * either. Reconstruction is preserved; output is normalized. Coarser and more
 * readable than the input, but no longer minimal.
 *
 * @param patch The patch to clean up.
 * @returns A new, semantically cleaned patch.
 */
export const semantic = (patch: Patch): Patch => {
  let diff: Patch = normalize(patch).map((op) => [op[0], op[1]] as PatchOperation);
  const equalities: number[] = [];
  let lastEquality: string | null = null;
  let insertions1 = 0;
  let deletions1 = 0;
  let insertions2 = 0;
  let deletions2 = 0;
  let pointer = 0;
  let changes = false;
  while (pointer < diff.length) {
    if (diff[pointer][0] === PATCH_OP_TYPE.EQL) {
      equalities.push(pointer);
      insertions1 = insertions2;
      deletions1 = deletions2;
      insertions2 = 0;
      deletions2 = 0;
      lastEquality = diff[pointer][1];
    } else {
      if (diff[pointer][0] === PATCH_OP_TYPE.INS) insertions2 += diff[pointer][1].length;
      else deletions2 += diff[pointer][1].length;
      if (
        lastEquality !== null &&
        lastEquality.length <= Math.max(insertions1, deletions1) &&
        lastEquality.length <= Math.max(insertions2, deletions2)
      ) {
        const index = equalities[equalities.length - 1];
        diff.splice(index, 0, [PATCH_OP_TYPE.DEL, lastEquality]);
        diff[index + 1] = [PATCH_OP_TYPE.INS, diff[index + 1][1]];
        equalities.pop();
        equalities.pop();
        pointer = equalities.length > 0 ? equalities[equalities.length - 1] : -1;
        insertions1 = 0;
        deletions1 = 0;
        insertions2 = 0;
        deletions2 = 0;
        lastEquality = null;
        changes = true;
      }
    }
    pointer++;
  }
  if (changes) diff = canonicalMerge(diff);
  diff = align(diff);
  pointer = 1;
  while (pointer < diff.length) {
    if (diff[pointer - 1][0] === PATCH_OP_TYPE.DEL && diff[pointer][0] === PATCH_OP_TYPE.INS) {
      const deletion = diff[pointer - 1][1];
      const insertion = diff[pointer][1];
      const overlap1 = overlap(deletion, insertion);
      const overlap2 = overlap(insertion, deletion);
      if (overlap1 >= overlap2) {
        if (overlap1 * 2 >= deletion.length || overlap1 * 2 >= insertion.length) {
          diff.splice(pointer, 0, [PATCH_OP_TYPE.EQL, insertion.slice(0, overlap1)]);
          diff[pointer - 1] = [PATCH_OP_TYPE.DEL, deletion.slice(0, deletion.length - overlap1)];
          diff[pointer + 1] = [PATCH_OP_TYPE.INS, insertion.slice(overlap1)];
          pointer++;
        }
      } else if (overlap2 * 2 >= deletion.length || overlap2 * 2 >= insertion.length) {
        diff.splice(pointer, 0, [PATCH_OP_TYPE.EQL, deletion.slice(0, overlap2)]);
        diff[pointer - 1] = [PATCH_OP_TYPE.INS, insertion.slice(0, insertion.length - overlap2)];
        diff[pointer + 1] = [PATCH_OP_TYPE.DEL, deletion.slice(overlap2)];
        pointer++;
      }
      pointer++;
    }
    pointer++;
  }
  return normalize(diff);
};

const shiftBoundaries = (lns: string[], changed: Uint8Array, otherChanged: Uint8Array): void => {
  const iEnd = lns.length;
  const otherEnd = otherChanged.length;
  let i = 0;
  let j = 0;
  while (true) {
    // Scan forward to the next run of changes, tracking the matching point in
    // the other file: one unchanged line there for each unchanged line here.
    while (i < iEnd && !changed[i]) {
      while (j < otherEnd && otherChanged[j]) j++;
      j++;
      i++;
    }
    if (i >= iEnd) break;
    let start = i;
    i++;
    while (i < iEnd && changed[i]) i++;
    while (j < otherEnd && otherChanged[j]) j++;
    let runLength: number;
    let corresponding: number;
    do {
      runLength = i - start;
      // Back, merging with the run before.
      while (start > 0 && lns[start - 1] === lns[i - 1]) {
        start--;
        changed[start] = 1;
        i--;
        changed[i] = 0;
        while (start > 0 && changed[start - 1]) start--;
        j--;
        while (j >= 0 && otherChanged[j]) j--;
      }
      // `iEnd` means no point where the run lines up with the other file.
      corresponding = j > 0 && otherChanged[j - 1] ? i : iEnd;
      // Forward, absorbing the run after. Absorbing is load-bearing: writing
      // the flag onto an already-changed line would be a no-op while the clear
      // at `start` still fired, dropping a changed line and breaking
      // reconstruction.
      while (i !== iEnd && lns[start] === lns[i]) {
        changed[start] = 0;
        start++;
        changed[i] = 1;
        i++;
        while (i < iEnd && changed[i]) i++;
        j++;
        while (j < otherEnd && otherChanged[j]) {
          corresponding = i;
          j++;
        }
      }
    } while (runLength !== i - start);
    // Pull the merged run back to where it lines up with the other file.
    while (corresponding < i) {
      start--;
      changed[start] = 1;
      i--;
      changed[i] = 0;
      j--;
      while (j >= 0 && otherChanged[j]) j--;
    }
  }
};

const sameFlags = (a: Uint8Array, b: Uint8Array): boolean => {
  const length = a.length;
  for (let i = 0; i < length; i++) if (a[i] !== b[i]) return false;
  return true;
};

/**
 * Rounds of {@link shiftBoundaries} over both files. GNU runs one and never
 * looks at its own output again, so it does not care that one round is not a
 * fixed point: its closing back-off can free room an earlier run could still
 * have used, and the pass never revisits. Repeating until the flags stop
 * changing is what makes this idempotent, and it agrees with GNU on marginally
 * more inputs than a single round does.
 *
 * The comparison has to be on the flags, not on "did a write happen". The
 * backward loop routinely moves a run back and the forward loop returns it to
 * exactly where it started, so a write-happened flag never clears and the cap
 * becomes the ordinary exit path rather than a limit.
 *
 * Measured over 260k pairs of 20 to 640 lines, mixing `lines.diff` output with
 * arbitrary valid alignments: two rounds settle all but four, and those four
 * need three and are all at the longest length. Rebuilt with a cap of three and
 * run over another 240k, none needed a fourth. Extra rounds are a long-input
 * phenomenon and are not confined to `lines.diff` output, so the cap is set well
 * above the observed maximum. Hitting it would leave a patch that still
 * reconstructs `dst` with the same edit volume but is not necessarily a fixed
 * point; the suite asserts convergence on the input class that gets closest.
 */
const ROUNDS = 8;

/**
 * Canonicalizes where a line-level patch puts its hunks. A minimal edit script
 * is rarely unique — repeated lines make several equally short scripts possible
 * — so instead of emitting whichever one the traceback happened to reach, this
 * moves every run of changed lines to the position GNU `diff` would choose:
 * as far down as it will go, merged with the runs it meets on the way, and
 * lined up with the corresponding run in the other file. Hunks then land where
 * a reader expects them, and byte-for-byte agreement with GNU goes up sharply.
 *
 * @param src Source lines the patch was computed from.
 * @param dst Destination lines the patch was computed from.
 * @param patch The line-level patch to canonicalize.
 * @returns A new patch with the same reconstruction and GNU's hunk placement.
 */
export const shiftDown = (src: string[], dst: string[], patch: LinePatch): LinePatch => {
  const srcLength = src.length;
  const dstLength = dst.length;
  const changedSrc = new Uint8Array(srcLength);
  const changedDst = new Uint8Array(dstLength);
  const length = patch.length;
  let changes = false;
  for (let k = 0; k < length; k++) {
    const op = patch[k];
    const type = op[0];
    if (type === LINE_PATCH_OP_TYPE.EQL) continue;
    // The index of the other side is an anchor, not a covered line.
    if (type !== LINE_PATCH_OP_TYPE.INS) changedSrc[op[1]] = 1;
    if (type !== LINE_PATCH_OP_TYPE.DEL) changedDst[op[2]] = 1;
    changes = true;
  }
  if (!changes) return patch.map((op) => [op[0], op[1], op[2]]);
  const beforeSrc = new Uint8Array(srcLength);
  const beforeDst = new Uint8Array(dstLength);
  for (let round = 0; round < ROUNDS; round++) {
    beforeSrc.set(changedSrc);
    beforeDst.set(changedDst);
    shiftBoundaries(src, changedSrc, changedDst);
    shiftBoundaries(dst, changedDst, changedSrc);
    if (sameFlags(beforeSrc, changedSrc) && sameFlags(beforeDst, changedDst)) break;
  }
  const result: LinePatch = [];
  let i = 0;
  let j = 0;
  while (true) {
    while (i < srcLength && changedSrc[i]) {
      result.push([LINE_PATCH_OP_TYPE.DEL, i, j - 1]);
      i++;
    }
    while (j < dstLength && changedDst[j]) {
      result.push([LINE_PATCH_OP_TYPE.INS, i - 1, j]);
      j++;
    }
    if (i >= srcLength || j >= dstLength) break;
    result.push([LINE_PATCH_OP_TYPE.EQL, i, j]);
    i++;
    j++;
  }
  return result;
};
