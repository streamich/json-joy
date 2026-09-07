import * as str from './str';
import * as tok from './tok';

const tokenRegex = /[\p{L}\p{N}\p{M}]+|\s+|[^\p{L}\p{N}\p{M}\s]/gu;

/**
 * Splits text into a token stream that concatenates back to the input exactly:
 * maximal runs of word characters (`\p{L}\p{N}\p{M}`), maximal runs of
 * whitespace, and every other character as its own token (surrogate pairs kept
 * whole).
 */
export const words = (text: string): string[] => text.match(tokenRegex) ?? [];

/**
 * Word-level diff: tokenizes both strings, diffs the token sequences, and maps
 * the result back to a character-level {@link str.Patch} whose operation
 * boundaries always fall on token boundaries. Composes with everything in
 * `str` and `optimize`.
 *
 * @param src Old string.
 * @param dst New string.
 * @param tokenize Tokenizer; must partition its input exactly. Defaults to
 *     {@link words}.
 * @returns A {@link str.Patch} aligned to token boundaries.
 */
export const diff = (src: string, dst: string, tokenize: (text: string) => string[] = words): str.Patch => {
  const a = tokenize(src);
  const b = tokenize(dst);
  const patch = tok.diff(a, b);
  const result: str.Patch = [];
  let si = 0;
  let di = 0;
  for (const [type, count] of patch) {
    if (type === str.PATCH_OP_TYPE.EQL) {
      result.push([str.PATCH_OP_TYPE.EQL, a.slice(si, si + count).join('')]);
      si += count;
      di += count;
    } else if (type === str.PATCH_OP_TYPE.DEL) {
      result.push([str.PATCH_OP_TYPE.DEL, a.slice(si, si + count).join('')]);
      si += count;
    } else {
      result.push([str.PATCH_OP_TYPE.INS, b.slice(di, di + count).join('')]);
      di += count;
    }
  }
  return result;
};
