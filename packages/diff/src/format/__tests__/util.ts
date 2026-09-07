import * as lines from '../../lines';
import {diffKeys} from '../hunks';
import {type Hunk, HUNK_OP_TYPE} from '../types';

/** Serializers yield chunks; tests compare whole documents. */
export const text = (chunks: Iterable<string>): string => {
  let out = '';
  for (const chunk of chunks) out += chunk;
  return out;
};

/**
 * A file, as a command reads one: lines without terminators plus whether the
 * last one is terminated. `'a\nb'` is two lines, the second unterminated.
 */
export class File {
  public readonly lines: string[];
  public readonly noEol: boolean;

  constructor(content: string) {
    this.noEol = content !== '' && !content.endsWith('\n');
    this.lines = content === '' ? [] : (this.noEol ? content : content.slice(0, -1)).split('\n');
  }
}

/** The whole pipeline a `diff` command runs, up to the writers. */
export const diff = (a: string, b: string) => {
  const src = new File(a);
  const dst = new File(b);
  const patch = lines.diff(diffKeys(src.lines, src.noEol), diffKeys(dst.lines, dst.noEol));
  return {
    src: src.lines,
    dst: dst.lines,
    patch,
    opts: {srcNoEol: src.noEol, dstNoEol: dst.noEol},
  };
};

/**
 * Replays hunks against `src`, checking every line number and context line on
 * the way. A hunk set can be plausible in every printed column and still be
 * unapplicable; this is the property that catches it.
 */
export const replay = (src: string[], hunks: Hunk[]): string[] => {
  const out: string[] = [];
  let si = 0;
  for (const hunk of hunks) {
    const start = hunk.oldCount ? hunk.oldStart - 1 : hunk.oldStart;
    expect(start).toBeGreaterThanOrEqual(si);
    while (si < start) out.push(src[si++]);
    expect(hunk.newStart).toBe(hunk.newCount ? out.length + 1 : out.length);
    let oldSeen = 0;
    let newSeen = 0;
    for (const line of hunk.lines) {
      if (line.op !== HUNK_OP_TYPE.INS) {
        expect(src[si]).toBe(line.text);
        oldSeen++;
      }
      if (line.op === HUNK_OP_TYPE.INS) {
        out.push(line.text);
        newSeen++;
      } else if (line.op === HUNK_OP_TYPE.EQL) {
        out.push(src[si]);
        newSeen++;
      }
      if (line.op !== HUNK_OP_TYPE.INS) si++;
    }
    expect(oldSeen).toBe(hunk.oldCount);
    expect(newSeen).toBe(hunk.newCount);
  }
  while (si < src.length) out.push(src[si++]);
  return out;
};
