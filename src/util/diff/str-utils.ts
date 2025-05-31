import {overlap, Patch, PATCH_OP_TYPE, sfx} from "./str";

export const cleanupPatch = (patch: Patch): void => {
  var changes = false;
  var equalities = []; // Stack of indices where equalities are found.
  var equalitiesLength = 0; // Keeping our own length var is faster in JS.
  /** @type {?string} */
  var lastequality = null;
  // Always equal to diffs[equalities[equalitiesLength - 1]][1]
  var pointer = 0; // Index of current position.
  // Number of characters that changed prior to the equality.
  var length_insertions1 = 0;
  var length_deletions1 = 0;
  // Number of characters that changed after the equality.
  var length_insertions2 = 0;
  var length_deletions2 = 0;
  while (pointer < patch.length) {
    if (patch[pointer][0] == PATCH_OP_TYPE.EQL) {
      // Equality found.
      equalities[equalitiesLength++] = pointer;
      length_insertions1 = length_insertions2;
      length_deletions1 = length_deletions2;
      length_insertions2 = 0;
      length_deletions2 = 0;
      lastequality = patch[pointer][1];
    } else {
      // An insertion or deletion.
      if (patch[pointer][0] == PATCH_OP_TYPE.INS) {
        length_insertions2 += patch[pointer][1].length;
      } else {
        length_deletions2 += patch[pointer][1].length;
      }
      // Eliminate an equality that is smaller or equal to the edits on both
      // sides of it.
      if (
        lastequality &&
        lastequality.length <=
          Math.max(length_insertions1, length_deletions1) &&
        lastequality.length <= Math.max(length_insertions2, length_deletions2)
      ) {
        // Duplicate record.
        patch.splice(equalities[equalitiesLength - 1], 0, [
          PATCH_OP_TYPE.DEL,
          lastequality,
        ]);
        // Change second copy to insert.
        patch[equalities[equalitiesLength - 1] + 1][0] = PATCH_OP_TYPE.INS;
        // Throw away the equality we just deleted.
        equalitiesLength--;
        // Throw away the previous equality (it needs to be reevaluated).
        equalitiesLength--;
        pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
        length_insertions1 = 0; // Reset the counters.
        length_deletions1 = 0;
        length_insertions2 = 0;
        length_deletions2 = 0;
        lastequality = null;
        changes = true;
      }
    }
    pointer++;
  }

  // Normalize the diff.
  if (changes) {
    cleanupPatch(patch);
  }
  cleanupSemanticLossless(patch);

  // Find any overlaps between deletions and insertions.
  // e.g: <del>abcxxx</del><ins>xxxdef</ins>
  //   -> <del>abc</del>xxx<ins>def</ins>
  // e.g: <del>xxxabc</del><ins>defxxx</ins>
  //   -> <ins>def</ins>xxx<del>abc</del>
  // Only extract an overlap if it is as big as the edit ahead or behind it.
  pointer = 1;
  while (pointer < patch.length) {
    if (
      patch[pointer - 1][0] == PATCH_OP_TYPE.DEL &&
      patch[pointer][0] == PATCH_OP_TYPE.INS
    ) {
      var deletion = patch[pointer - 1][1];
      var insertion = patch[pointer][1];
      var overlap_length1 = overlap(deletion, insertion);
      var overlap_length2 = overlap(insertion, deletion);
      if (overlap_length1 >= overlap_length2) {
        if (
          overlap_length1 >= deletion.length / 2 ||
          overlap_length1 >= insertion.length / 2
        ) {
          // Overlap found.  Insert an equality and trim the surrounding edits.
          patch.splice(pointer, 0, [
            PATCH_OP_TYPE.EQL,
            insertion.substring(0, overlap_length1),
          ]);
          patch[pointer - 1][1] = deletion.substring(
            0,
            deletion.length - overlap_length1
          );
          patch[pointer + 1][1] = insertion.substring(overlap_length1);
          pointer++;
        }
      } else {
        if (
          overlap_length2 >= deletion.length / 2 ||
          overlap_length2 >= insertion.length / 2
        ) {
          // Reverse overlap found.
          // Insert an equality and swap and trim the surrounding edits.
          patch.splice(pointer, 0, [
            PATCH_OP_TYPE.EQL,
            deletion.substring(0, overlap_length2),
          ]);
          patch[pointer - 1][0] = PATCH_OP_TYPE.INS;
          patch[pointer - 1][1] = insertion.substring(
            0,
            insertion.length - overlap_length2
          );
          patch[pointer + 1][0] = PATCH_OP_TYPE.DEL;
          patch[pointer + 1][1] = deletion.substring(overlap_length2);
          pointer++;
        }
      }
      pointer++;
    }
    pointer++;
  }
};

const nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/;
const whitespaceRegex_ = /\s/;
const linebreakRegex_ = /[\r\n]/;
const blanklineEndRegex_ = /\n\r?\n$/;
const blanklineStartRegex_ = /^\r?\n\r?\n/;

/**
 * Given two strings, compute a score representing whether the internal
 * boundary falls on logical boundaries.
 * Scores range from 6 (best) to 0 (worst).
 * Closure, but does not reference any external variables.
 * @param {string} one First string.
 * @param {string} two Second string.
 * @return {number} The score.
 * @private
 */
const semanticScore = (one: string, two: string) => {
  if (!one || !two) return 6;
  const char1 = one.charAt(one.length - 1);
  const char2 = two.charAt(0);
  const nonAlphaNumeric1 = char1.match(nonAlphaNumericRegex_);
  const nonAlphaNumeric2 = char2.match(nonAlphaNumericRegex_);
  const whitespace1 = nonAlphaNumeric1 && char1.match(whitespaceRegex_);
  const whitespace2 = nonAlphaNumeric2 && char2.match(whitespaceRegex_);
  const lineBreak1 = whitespace1 && char1.match(linebreakRegex_);
  const lineBreak2 = whitespace2 && char2.match(linebreakRegex_);
  const blankLine1 = lineBreak1 && one.match(blanklineEndRegex_);
  const blankLine2 = lineBreak2 && two.match(blanklineStartRegex_);
  if (blankLine1 || blankLine2) return 5;
  else if (lineBreak1 || lineBreak2) return 4;
  else if (nonAlphaNumeric1 && !whitespace1 && whitespace2) return 3;
  else if (whitespace1 || whitespace2) return 2;
  else if (nonAlphaNumeric1 || nonAlphaNumeric2) return 1;
  return 0;
};

/**
 * Look for single edits surrounded on both sides by equalities
 * which can be shifted sideways to align the edit to a word boundary.
 * e.g: The c<ins>at c</ins>ame. -> The <ins>cat </ins>came.
 * @param {!Array.<!diff_match_patch.Diff>} patch Array of diff tuples.
 */
const cleanupSemanticLossless = (patch: Patch): void => {
  var pointer = 1;
  // Intentionally ignore the first and last element (don't need checking).
  while (pointer < patch.length - 1) {
    if (
      patch[pointer - 1][0] == PATCH_OP_TYPE.EQL &&
      patch[pointer + 1][0] == PATCH_OP_TYPE.EQL
    ) {
      // This is a single edit surrounded by equalities.
      var equality1 = patch[pointer - 1][1];
      var edit = patch[pointer][1];
      var equality2 = patch[pointer + 1][1];

      // First, shift the edit as far left as possible.
      var commonOffset = sfx(equality1, edit);
      if (commonOffset) {
        var commonString = edit.substring(edit.length - commonOffset);
        equality1 = equality1.substring(0, equality1.length - commonOffset);
        edit = commonString + edit.substring(0, edit.length - commonOffset);
        equality2 = commonString + equality2;
      }

      // Second, step character by character right, looking for the best fit.
      var bestEquality1 = equality1;
      var bestEdit = edit;
      var bestEquality2 = equality2;
      var bestScore =
        semanticScore(equality1, edit) +
        semanticScore(edit, equality2);
      while (edit.charAt(0) === equality2.charAt(0)) {
        equality1 += edit.charAt(0);
        edit = edit.substring(1) + equality2.charAt(0);
        equality2 = equality2.substring(1);
        var score =
          semanticScore(equality1, edit) +
          semanticScore(edit, equality2);
        // The >= encourages trailing rather than leading whitespace on edits.
        if (score >= bestScore) {
          bestScore = score;
          bestEquality1 = equality1;
          bestEdit = edit;
          bestEquality2 = equality2;
        }
      }

      if (patch[pointer - 1][1] != bestEquality1) {
        // We have an improvement, save it back to the diff.
        if (bestEquality1) {
          patch[pointer - 1][1] = bestEquality1;
        } else {
          patch.splice(pointer - 1, 1);
          pointer--;
        }
        patch[pointer][1] = bestEdit;
        if (bestEquality2) {
          patch[pointer + 1][1] = bestEquality2;
        } else {
          patch.splice(pointer + 1, 1);
          pointer--;
        }
      }
    }
    pointer++;
  }
};
