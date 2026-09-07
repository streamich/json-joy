import type {LinePatch} from '../line';
import {hunks} from './hunks';
import {expander} from './tabs';
import {type EdOptions, type Hunk, HUNK_OP_TYPE, type TabOptions} from './types';

/** Ed range: `4,5` for several lines, `4` for one, and the line an append follows. */
const range = (start: number, count: number): string => (count > 1 ? start + ',' + (start + count - 1) : '' + start);

/**
 * Whether a hunk replaces lines with the identical text, which an ed script has
 * no way to express and no reason to. It can only arise from the one difference
 * this format cannot carry: a last line that kept its text and lost or gained
 * its terminator. `lines.diff` never emits a change between equal strings, so
 * nothing else produces this shape.
 *
 * A caller following {@link ed}'s contract - plain arrays, never
 * `format.diffKeys` - cannot produce it either, so this is unreachable from
 * {@link ed} itself. It stays for {@link edHunks}, which takes hunks from
 * anywhere, including a keyed pipeline or a patch read off the wire.
 */
const noop = (hunk: Hunk): boolean => {
  const oldCount = hunk.oldCount;
  if (!oldCount || oldCount !== hunk.newCount) return false;
  const lines = hunk.lines;
  const length = lines.length;
  let i = 0;
  let j = 0;
  let pairs = 0;
  // Walked by side rather than by position: `lines` is not `oldCount` old-side
  // entries followed by the new side unless it came from `hunks()`, and indexing
  // it that way threw on every hunk carrying context and on every one read off
  // the wire, which is exactly what this is documented to take.
  for (;;) {
    while (i < length && lines[i].op === HUNK_OP_TYPE.INS) i++;
    while (j < length && lines[j].op === HUNK_OP_TYPE.DEL) j++;
    if (i === length || j === length) break;
    if (lines[i++].text !== lines[j++].text) return false;
    pairs++;
  }
  // Fewer pairs than the hunk covers means its old side is not in its lines at
  // all - a blind ed delete - and what it replaces is unknown, not identical.
  return pairs === oldCount;
};

/**
 * Renders hunks as an `ed` script, `diff -e`, **last hunk first**. An ed script
 * is evaluated as it applies, so a command written top-down would renumber the
 * lines its own later commands address; emitted bottom-up, every address still
 * refers to the file as it was. This is the classic silently-wrong `-e` bug: the
 * output looks plausible and produces the wrong file.
 *
 * Hunks must carry no context (see {@link ed}); each renders as one `Na` / `Nd`
 * / `N,Mc` command.
 *
 * @param hunks Context-free hunks to render, in file order.
 * @param opts The `-t` tab stop, if any. An ed script has no line flag, so a
 *     carriage return re-emits nothing.
 * @returns Chunks of the script, one line each.
 */
export function* edHunks(hunks: Hunk[], opts?: TabOptions): Generator<string> {
  const text = expander(opts?.tabs);
  for (let i = hunks.length - 1; i >= 0; i--) {
    const hunk = hunks[i];
    if (noop(hunk)) continue;
    const oldCount = hunk.oldCount;
    const newCount = hunk.newCount;
    yield range(hunk.oldStart, oldCount) + (oldCount ? (newCount ? 'c' : 'd') : 'a') + '\n';
    if (!newCount) continue;
    const lines = hunk.lines;
    const linesLength = lines.length;
    let inserting = true;
    for (let j = 0; j < linesLength; j++) {
      const line = lines[j];
      if (line.op !== HUNK_OP_TYPE.INS) continue;
      if (!inserting) {
        yield 'a\n';
        inserting = true;
      }
      if (line.text === '.') {
        yield '..\n.\ns/.//\n';
        inserting = false;
      } else yield text(line.text) + '\n';
    }
    if (inserting) yield '.\n';
  }
}

/**
 * Renders hunks as a **forward** `ed` script, `diff -f`: the same commands in
 * file order rather than bottom-up, with the letter before the range and the
 * range's two numbers separated by a space.
 *
 * Nothing applies it. Written top-down every command renumbers the lines the
 * ones after it address, so `ed` would produce the wrong file, and the dot
 * escaping {@link edHunks} does is left out - GNU leaves it out too, so a line
 * that is a lone dot ends the insert early and the script does not even parse.
 * It exists because POSIX lists `-f`, and it is a *description* of the changes,
 * not a program.
 *
 * @param hunks Context-free hunks to render, in file order.
 * @param opts The `-t` tab stop, if any.
 * @returns Chunks of the script, one line each.
 */
export function* forwardEdHunks(hunks: Hunk[], opts?: TabOptions): Generator<string> {
  const text = expander(opts?.tabs);
  const length = hunks.length;
  for (let i = 0; i < length; i++) {
    const hunk = hunks[i];
    const oldCount = hunk.oldCount;
    const newCount = hunk.newCount;
    const start = hunk.oldStart;
    yield (oldCount ? (newCount ? 'c' : 'd') : 'a') +
      (oldCount > 1 ? start + ' ' + (start + oldCount - 1) : '' + start) +
      '\n';
    if (!newCount) continue;
    const lines = hunk.lines;
    const linesLength = lines.length;
    for (let j = 0; j < linesLength; j++) {
      const line = lines[j];
      if (line.op === HUNK_OP_TYPE.INS) yield text(line.text) + '\n';
    }
    yield '.\n';
  }
}

/**
 * Serializes a line patch as a forward `ed` script, `diff -f`, in chunks.
 *
 * @param src Source lines, without terminators.
 * @param dst Destination lines, without terminators.
 * @param patch A patch between them, from `lines.diff` or `line.diff`.
 * @param opts No-final-newline flags, which the script cannot carry.
 * @returns Chunks of the script, one line each.
 */
export function* forwardEd(src: string[], dst: string[], patch: LinePatch, opts?: EdOptions): Generator<string> {
  yield* forwardEdHunks(hunks(src, dst, patch, {...opts, context: 0}), opts);
}

/**
 * Serializes a line patch as an `ed` script, `diff -e`, in chunks. Ed scripts
 * carry no context and no header, so one change run is one command and there is
 * nothing to label.
 *
 * @param src Source lines, without terminators.
 * @param dst Destination lines, without terminators.
 * @param patch A patch between them, from `lines.diff` or `line.diff` over the
 *     **plain** arrays.
 * @param opts No-final-newline flags, which an ed script cannot carry.
 * @returns Chunks of the script, one line each.
 */
export function* ed(src: string[], dst: string[], patch: LinePatch, opts?: EdOptions): Generator<string> {
  yield* edHunks(hunks(src, dst, patch, {...opts, context: 0}), opts);
}
