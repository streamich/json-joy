import type {LinePatch} from '../line';
import {paint} from './colors';
import {flags} from './flags';
import {hunks} from './hunks';
import {expandLine} from './tabs';
import {
  type ColorOptions,
  type ContextOptions,
  type FlagOptions,
  type Hunk,
  HUNK_OP_TYPE,
  type HunkLine,
  type LabelOptions,
  NO_NEWLINE,
  type TabOptions,
} from './types';

const range = (start: number, count: number): string => (count > 1 ? start + ',' + (start + count - 1) : '' + start);

/**
 * Per line, whether its change run holds deletions *and* insertions. GNU marks
 * those `!` on both sides and pure runs `-`/`+`, and decides it per run, not per
 * hunk: one hunk can carry a `!` run and a `+` run.
 */
const changedRuns = (lines: HunkLine[]): Uint8Array => {
  const length = lines.length;
  const out = new Uint8Array(length);
  for (let i = 0; i < length; ) {
    if (lines[i].op === HUNK_OP_TYPE.EQL) {
      i++;
      continue;
    }
    let end = i;
    let del = false;
    let ins = false;
    for (; end < length && lines[end].op !== HUNK_OP_TYPE.EQL; end++) {
      if (lines[end].op === HUNK_OP_TYPE.DEL) del = true;
      else ins = true;
    }
    if (del && ins) out.fill(1, i, end);
    i = end;
  }
  return out;
};

/**
 * Renders hunks as a context diff, `diff -c`. Takes hunks rather than a patch,
 * so a `FilePatch` read off the wire renders with `contextHunks(file.hunks, file)`.
 *
 * @param hunks Hunks to render.
 * @param opts File names and timestamps; without a name no `***`/`---` header
 *     is emitted, since the package reads no filesystem and formats no clocks.
 *     Also the {@link DiffColors} palette, if any.
 * @returns Chunks of the diff, one line each.
 */
export function* contextHunks(
  hunks: Hunk[],
  opts?: LabelOptions & ColorOptions & TabOptions & FlagOptions,
): Generator<string> {
  const length = hunks.length;
  if (!length) return;
  const colors = opts?.colors;
  const reset = colors?.reset ?? '';
  const tabs = opts?.tabs;
  /** `[written, written before an empty line, re-emitted after a CR]` per marker. */
  const MARKS: Record<string, [string, string, string]> = {
    ' ': flags(' ', opts),
    '!': flags('!', opts),
    '-': flags('-', opts),
    '+': flags('+', opts),
  };
  const body = (mark: string, text: string): string => {
    const [prefix, blank, redraw] = MARKS[mark];
    return (text === '' ? blank : prefix) + (tabs ? expandLine(text, tabs, redraw) : text);
  };
  const oldName = opts?.oldName;
  const newName = opts?.newName;
  if (oldName !== undefined || newName !== undefined) {
    const oldTime = opts?.oldTime;
    const newTime = opts?.newTime;
    const head = colors?.header;
    yield paint(head, '*** ' + (oldName ?? '') + (oldTime === undefined ? '' : '\t' + oldTime), reset) + '\n';
    yield paint(head, '--- ' + (newName ?? '') + (newTime === undefined ? '' : '\t' + newTime), reset) + '\n';
  }
  for (let i = 0; i < length; i++) {
    const hunk = hunks[i];
    const lines = hunk.lines;
    const linesLength = lines.length;
    const changed = changedRuns(lines);
    let del = false;
    let ins = false;
    for (let j = 0; j < linesLength; j++) {
      const op = lines[j].op;
      if (op === HUNK_OP_TYPE.DEL) del = true;
      else if (op === HUNK_OP_TYPE.INS) ins = true;
    }
    const section = hunk.section;
    yield '***************' + (section === undefined ? '' : ' ' + section) + '\n';
    yield paint(colors?.line, '*** ' + range(hunk.oldStart, hunk.oldCount) + ' ****', reset) + '\n';
    if (del)
      for (let j = 0; j < linesLength; j++) {
        const line = lines[j];
        const op = line.op;
        if (op === HUNK_OP_TYPE.INS) continue;
        yield paint(colors?.del, body(op === HUNK_OP_TYPE.EQL ? ' ' : changed[j] ? '!' : '-', line.text), reset) + '\n';
        if (line.noEol) yield NO_NEWLINE + '\n';
      }
    yield paint(colors?.line, '--- ' + range(hunk.newStart, hunk.newCount) + ' ----', reset) + '\n';
    if (ins)
      for (let j = 0; j < linesLength; j++) {
        const line = lines[j];
        const op = line.op;
        if (op === HUNK_OP_TYPE.DEL) continue;
        yield paint(colors?.add, body(op === HUNK_OP_TYPE.EQL ? ' ' : changed[j] ? '!' : '+', line.text), reset) + '\n';
        if (line.noEol) yield NO_NEWLINE + '\n';
      }
  }
}

/**
 * Serializes a line patch as a context diff, `diff -c` / `-C n`, in chunks: no
 * diff text is ever assembled into one string, though the hunks are built
 * eagerly before the first chunk.
 *
 * @param src Source lines, without terminators.
 * @param dst Destination lines, without terminators.
 * @param patch A patch between them, from `lines.diff` or `line.diff`.
 * @param opts Context width (`3` by default, `0` is meaningful), labels,
 *     no-final-newline flags.
 * @returns Chunks of the diff, one line each.
 */
export function* context(src: string[], dst: string[], patch: LinePatch, opts?: ContextOptions): Generator<string> {
  yield* contextHunks(hunks(src, dst, patch, opts), opts);
}
