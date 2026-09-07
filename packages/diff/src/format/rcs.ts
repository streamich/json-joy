import type {LinePatch} from '../line';
import {hunks} from './hunks';
import {expander} from './tabs';
import {type Hunk, HUNK_OP_TYPE, type RcsOptions, type TabOptions} from './types';

/**
 * Renders hunks as an RCS diff, `diff -n`, in file order. Every address is a
 * line of the *original* file, so unlike an ed script this one is not read
 * back-to-front and needs no bottom-up trick.
 *
 * Hunks must carry no context (see {@link rcs}); each renders as `dN count`
 * for its deletions and `aN count` plus the raw lines for its insertions,
 * where the `a` address is the last original line the hunk covers.
 *
 * There is no `\ No newline at end of file` marker in this format and none is
 * needed: the lines are written verbatim, so an unterminated last line is
 * simply written without its terminator.
 *
 * @param hunks Context-free hunks to render, in file order.
 * @param opts The `-t` tab stop, if any. An RCS delta has no line flag, so a
 *     carriage return re-emits nothing.
 * @returns Chunks of the diff, one line each — except a final unterminated line.
 */
export function* rcsHunks(hunks: Hunk[], opts?: TabOptions): Generator<string> {
  const length = hunks.length;
  const text = expander(opts?.tabs);
  for (let i = 0; i < length; i++) {
    const hunk = hunks[i];
    const oldStart = hunk.oldStart;
    const oldCount = hunk.oldCount;
    const newCount = hunk.newCount;
    // Last original line covered; for an empty range that is the line before it.
    const last = oldCount ? oldStart + oldCount - 1 : oldStart;
    if (oldCount) yield 'd' + oldStart + ' ' + oldCount + '\n';
    if (!newCount) continue;
    yield 'a' + last + ' ' + newCount + '\n';
    const lines = hunk.lines;
    const linesLength = lines.length;
    for (let j = 0; j < linesLength; j++) {
      const line = lines[j];
      if (line.op !== HUNK_OP_TYPE.INS) continue;
      yield line.noEol ? text(line.text) : text(line.text) + '\n';
    }
  }
}

/**
 * Serializes a line patch as an RCS diff, `diff -n`, in chunks. RCS diffs carry
 * no context and no header, so one change run is one `d`/`a` pair and there is
 * nothing to label.
 *
 * @param src Source lines, without terminators.
 * @param dst Destination lines, without terminators.
 * @param patch A patch between them, from `lines.diff` or `line.diff`.
 * @param opts No-final-newline flags; `dstNoEol` drops the terminator from the
 *     last inserted line, which is how this format spells it.
 * @returns Chunks of the diff, one line each — except a final unterminated line.
 */
export function* rcs(src: string[], dst: string[], patch: LinePatch, opts?: RcsOptions): Generator<string> {
  yield* rcsHunks(hunks(src, dst, patch, {...opts, context: 0}), opts);
}
