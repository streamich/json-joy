import type {LinePatch} from '../line';
import {paint} from './colors';
import {hunks} from './hunks';
import {expander} from './tabs';
import {
  type ColorOptions,
  type FlagOptions,
  type Hunk,
  type LabelOptions,
  NO_NEWLINE,
  type TabOptions,
  type UnifiedOptions,
} from './types';

/** `-U n` range: the count is omitted when it is 1, and an empty range keeps its `,0`. */
const range = (start: number, count: number): string => (count === 1 ? '' + start : start + ',' + count);

/** Line prefixes, indexed by `HUNK_OP_TYPE + 1`. */
const MARK = ['-', ' ', '+'];

/**
 * Renders hunks as a unified diff, `diff -u`. Takes hunks rather than a patch,
 * so a `FilePatch` read off the wire renders with `unifiedHunks(file.hunks, file)`.
 *
 * @param hunks Hunks to render.
 * @param opts File names and timestamps; without a name no `---`/`+++` header
 *     is emitted, since the package reads no filesystem and formats no clocks.
 *     Also the {@link DiffColors} palette, if any.
 * @returns Chunks of the diff, one line each.
 */
export function* unifiedHunks(
  hunks: Hunk[],
  opts?: LabelOptions & ColorOptions & TabOptions & FlagOptions,
): Generator<string> {
  const length = hunks.length;
  if (!length) return;
  const colors = opts?.colors;
  const reset = colors?.reset ?? '';
  const space = opts?.initialTab ? '\t' : ' ';
  const tab = opts?.initialTab ? '\t' : '';
  const blanks = !!opts?.suppressBlankEmpty;
  // No flag: unified writes its `-`/`+`/` ` inline, so a carriage return does
  // not re-emit anything. Measured.
  const text = expander(opts?.tabs);
  const oldName = opts?.oldName;
  const newName = opts?.newName;
  if (oldName !== undefined || newName !== undefined) {
    const oldTime = opts?.oldTime;
    const newTime = opts?.newTime;
    const head = colors?.header;
    yield paint(head, '--- ' + (oldName ?? '') + (oldTime === undefined ? '' : '\t' + oldTime), reset) + '\n';
    yield paint(head, '+++ ' + (newName ?? '') + (newTime === undefined ? '' : '\t' + newTime), reset) + '\n';
  }
  // A `-p` trailer stays outside the paint, which is GNU's placement: the reset
  // lands right after the closing `@@`.
  for (let i = 0; i < length; i++) {
    const hunk = hunks[i];
    const section = hunk.section;
    yield paint(
      colors?.line,
      '@@ -' + range(hunk.oldStart, hunk.oldCount) + ' +' + range(hunk.newStart, hunk.newCount) + ' @@',
      reset,
    ) +
      (section === undefined ? '' : ' ' + section) +
      '\n';
    const lines = hunk.lines;
    const linesLength = lines.length;
    for (let j = 0; j < linesLength; j++) {
      const line = lines[j];
      const op = line.op;
      const empty = blanks && line.text === '';
      const prefix = op ? MARK[op + 1] + (empty ? '' : tab) : empty ? '' : space;
      yield paint(op ? (op < 0 ? colors?.del : colors?.add) : undefined, prefix + text(line.text), reset) + '\n';
      if (line.noEol) yield NO_NEWLINE + '\n';
    }
  }
}

/**
 * Serializes a line patch as a unified diff, `diff -u`, in chunks: a command
 * can pipe them straight to stdout, and **no diff text is ever assembled into
 * one string**. That is the streaming property, and it is the only one - the
 * hunks themselves are built eagerly first, so what precedes the first chunk
 * costs O(lines of both files); see {@link hunks}. Yields nothing at all when
 * the files are identical.
 *
 * @param src Source lines, without terminators.
 * @param dst Destination lines, without terminators.
 * @param patch A patch between them, from `lines.diff` or `line.diff`.
 * @param opts Context width (`3` by default, `0` is meaningful), labels,
 *     no-final-newline flags.
 * @returns Chunks of the diff, one line each.
 */
export function* unified(src: string[], dst: string[], patch: LinePatch, opts?: UnifiedOptions): Generator<string> {
  yield* unifiedHunks(hunks(src, dst, patch, opts), opts);
}
