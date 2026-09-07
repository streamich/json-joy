import type {LinePatch} from '../line';
import {paint} from './colors';
import {flags} from './flags';
import {hunks} from './hunks';
import {expander} from './tabs';
import {
  type ColorOptions,
  type FlagOptions,
  type Hunk,
  HUNK_OP_TYPE,
  NO_NEWLINE,
  type NormalOptions,
  type TabOptions,
} from './types';

/**
 * Normal-format range: `7,9` for several lines, `7` for one, and for an empty
 * range the number of the line before it - `3a4` inserts after source line 3.
 */
const range = (start: number, count: number): string => (count > 1 ? start + ',' + (start + count - 1) : '' + start);

/**
 * Renders hunks as a normal diff - the default `diff` output, and what ~70% of
 * measured `diff` runs actually get. Hunks must carry no context (see
 * {@link normal}); each renders as one `NaM` / `NdM` / `NcM` command.
 *
 * @param hunks Context-free hunks to render.
 * @param opts The {@link DiffColors} palette and the `-t` tab stop, if any. The
 *     `---` between the two sides is never painted, which is GNU's choice.
 * @returns Chunks of the diff, one line each.
 */
export function* normalHunks(hunks: Hunk[], opts?: ColorOptions & TabOptions & FlagOptions): Generator<string> {
  const length = hunks.length;
  const colors = opts?.colors;
  const reset = colors?.reset ?? '';
  const tabs = opts?.tabs;
  const [del, delBlank, delRedraw] = flags('<', opts);
  const [ins, insBlank, insRedraw] = flags('>', opts);
  const delText = expander(tabs, delRedraw);
  const insText = expander(tabs, insRedraw);
  for (let i = 0; i < length; i++) {
    const hunk = hunks[i];
    const oldCount = hunk.oldCount;
    const newCount = hunk.newCount;
    const letter = oldCount ? (newCount ? 'c' : 'd') : 'a';
    yield paint(colors?.line, range(hunk.oldStart, oldCount) + letter + range(hunk.newStart, newCount), reset) + '\n';
    const lines = hunk.lines;
    const linesLength = lines.length;
    for (let j = 0; j < linesLength; j++) {
      const line = lines[j];
      if (line.op !== HUNK_OP_TYPE.DEL) continue;
      yield paint(colors?.del, (line.text === '' ? delBlank : del) + delText(line.text), reset) + '\n';
      if (line.noEol) yield NO_NEWLINE + '\n';
    }
    if (oldCount && newCount) yield '---\n';
    for (let j = 0; j < linesLength; j++) {
      const line = lines[j];
      if (line.op !== HUNK_OP_TYPE.INS) continue;
      yield paint(colors?.add, (line.text === '' ? insBlank : ins) + insText(line.text), reset) + '\n';
      if (line.noEol) yield NO_NEWLINE + '\n';
    }
  }
}

/**
 * Serializes a line patch as a normal diff, in chunks. Normal format carries no
 * context and no header, so one change run is one hunk and there is nothing to
 * label.
 *
 * @param src Source lines, without terminators.
 * @param dst Destination lines, without terminators.
 * @param patch A patch between them, from `lines.diff` or `line.diff`.
 * @param opts No-final-newline flags.
 * @returns Chunks of the diff, one line each.
 */
export function* normal(src: string[], dst: string[], patch: LinePatch, opts?: NormalOptions): Generator<string> {
  yield* normalHunks(hunks(src, dst, patch, {...opts, context: 0}), opts);
}
