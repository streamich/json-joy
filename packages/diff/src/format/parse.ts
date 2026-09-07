import {
  FilePatch,
  type GitMeta,
  Hunk,
  HUNK_OP_TYPE,
  HunkLine,
  ParseError,
  type ParseErrorCode,
  type ParseOptions,
  type PatchStyle,
} from './types';

/** `@@ -oldStart[,oldCount] +newStart[,newCount] @@[ section]`; a count of 1 is omitted. */
const UNIFIED_HUNK = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)$/;
/** The `***************` that opens a context hunk, plus an optional `-p` trailer. */
const CONTEXT_SEP = /^\*{15,}(.*)$/;
const CONTEXT_OLD = /^\*\*\* (\d+)(?:,(\d+))? \*{4,}$/;
const CONTEXT_NEW = /^--- (\d+)(?:,(\d+))? -{4,}$/;
/** `NaM` / `N,MdP` / `N,McP,Q` — normal format always prints both sides. */
const NORMAL_CMD = /^(\d+)(?:,(\d+))?([acd])(\d+)(?:,(\d+))?$/;
/** `Na` / `N,Md` / `N,Mc` — an ed command addresses one file, which is what tells the two apart. */
const ED_CMD = /^(\d+)(?:,(\d+))?([acd])$/;

/** A trailing CR belongs to the patch file's own terminators, never to a header. */
const chop = (line: string): string => (line.endsWith('\r') ? line.slice(0, -1) : line);

/** What a hunk header said its side holds, when it did not say a number. */
const enum SAID {
  /** A single-number range, which is what GNU writes for one line and for none alike. */
  AMBIGUOUS = -1,
  /** The body was already reported as broken; a count mismatch would add nothing. */
  BROKEN = -2,
}

/** C-quoted path, as git writes one whose name holds a space or a control character. */
const unquote = (text: string): [string, number] => {
  const length = text.length;
  let out = '';
  let i = 1;
  for (; i < length; i++) {
    const c = text[i];
    if (c === '"') return [out, i + 1];
    if (c !== '\\') {
      out += c;
      continue;
    }
    const e = text[++i];
    if (e === 't') out += '\t';
    else if (e === 'n') out += '\n';
    else if (e === 'r') out += '\r';
    else if (e >= '0' && e <= '7') {
      out += String.fromCharCode(parseInt(text.slice(i, i + 3), 8));
      i += 2;
    } else out += e ?? '';
  }
  return [out, i];
};

/**
 * `name` and `timestamp` from a header line: the name is everything up to the
 * first tab, or a C-quoted string when git wrote one — a path holding a space
 * or a control character arrives quoted on `---`/`+++` exactly as it does on
 * `diff --git`, and a reader that hands the quotes back names no file at all.
 */
const label = (rest: string): [string, string | undefined] => {
  if (rest.charCodeAt(0) === 34) {
    const [name, end] = unquote(rest);
    return [name, rest.charCodeAt(end) === 9 ? rest.slice(end + 1) : undefined];
  }
  const tab = rest.indexOf('\t');
  return tab < 0 ? [rest, undefined] : [rest.slice(0, tab), rest.slice(tab + 1)];
};

/** The `@@ … @@` / `*************** …` trailer, which is empty far more often than not. */
const trailer = (rest: string): string | undefined => (rest.charCodeAt(0) === 32 ? rest.slice(1) : rest) || undefined;

/**
 * Lines that begin `-` or `+` and are not hunk content: the next file's header,
 * a mail signature, a horizontal rule. They are why a body that outruns its
 * header count is reported rather than swallowed — trailing junk looks exactly
 * like an extra deletion, and tolerating junk is the point.
 */
const isDivider = (line: string): boolean =>
  line.startsWith('--- ') || line.startsWith('+++ ') || /^[-+]+ ?$/.test(line);

/**
 * Whether a line is a context-format body line. Body lines are
 * `<flag><space><text>`, so their second character is a space and a range
 * line's is not — the only reliable discriminator, since `--- 1,3 ----` is a
 * range line and `--- 1,3 ----` is a body line carrying that text.
 */
const isContextBody = (line: string | undefined): boolean => {
  if (line === undefined || line.length < 2 || line.charCodeAt(1) !== 32) return false;
  const flag = line[0];
  return flag === ' ' || flag === '-' || flag === '+' || flag === '!';
};

/**
 * The two names on a `diff --git` line. Paths may hold spaces, and the line has
 * no separator that content cannot contain, so git's own convention is the way
 * in: unless the change is a rename it writes the *same* path twice, which puts
 * the separating space exactly in the middle.
 */
const gitNames = (rest: string): [string, string] => {
  if (rest[0] === '"') {
    const [oldName, end] = unquote(rest);
    const tail = rest.slice(end + 1);
    return [oldName, tail[0] === '"' ? unquote(tail)[0] : tail];
  }
  const half = (rest.length - 1) / 2;
  if (Number.isInteger(half) && rest[half] === ' ') {
    const oldName = rest.slice(0, half);
    const newName = rest.slice(half + 1);
    if (oldName.slice(1) === newName.slice(1)) return [oldName, newName];
  }
  const space = rest.indexOf(' ');
  return space < 0 ? [rest, rest] : [rest.slice(0, space), rest.slice(space + 1)];
};

/** Strong style markers: multi-character sequences that content does not produce by accident. */
const isUnifiedMark = (line: string, next: string | undefined): boolean =>
  line.startsWith('diff --git ') ||
  UNIFIED_HUNK.test(line) ||
  (line.startsWith('--- ') && next !== undefined && next.startsWith('+++ '));
const isContextMark = (line: string, next: string | undefined): boolean =>
  CONTEXT_SEP.test(line) || (line.startsWith('*** ') && next !== undefined && next.startsWith('--- '));

/** Leading `<blank>`s of a line, which are an indent everywhere but inside a hunk body. */
const blanks = (line: string): number => {
  const end = line.length;
  let n = 0;
  while (n < end) {
    const c = line.charCodeAt(n);
    if (c !== 32 && c !== 9) break;
    n++;
  }
  return n;
};

/**
 * A patch that was indented as a whole — a mail body, a markdown block, a chat
 * transcript — with that indent taken back off. POSIX requires it before
 * anything else, and it is what makes a patch pasted out of prose applicable
 * instead of garbage.
 *
 * The width is read off the **first marker in the document**, the same line
 * {@link detect} reads the style off, rather than off every line: prose around
 * an indented patch carries no indent of its own, which is exactly what a
 * markdown code block produces. A marker at column 0 settles it as *not*
 * indented, and that ordering is what keeps a context line whose content begins
 * `@@` from being read as an indented hunk header — the real header sits above
 * it at column 0. Lines that do not carry the prefix are left alone; junk is
 * junk either way.
 *
 * @returns The same array when there is nothing to remove.
 */
const deindent = (lines: string[]): string[] => {
  const length = lines.length;
  /** The first weak marker, used only when the document holds no strong one. */
  let weak = -1;
  let at = -1;
  for (let i = 0; i < length && at < 0; i++) {
    const line = chop(lines[i]);
    const n = blanks(line);
    const head = n ? line.slice(n) : line;
    let tail = i + 1 < length ? chop(lines[i + 1]) : undefined;
    if (n && tail !== undefined && tail.startsWith(line.slice(0, n))) tail = tail.slice(n);
    if (isUnifiedMark(head, tail) || isContextMark(head, tail)) at = i;
    else if (weak < 0 && (NORMAL_CMD.test(head) || ED_CMD.test(head))) weak = i;
  }
  if (at < 0) at = weak;
  const width = at < 0 ? 0 : blanks(lines[at]);
  if (!width) return lines;
  const prefix = lines[at].slice(0, width);
  const out: string[] = [];
  for (let i = 0; i < length; i++) {
    const line = lines[i];
    out.push(line.startsWith(prefix) ? line.slice(width) : line);
  }
  return out;
};

const detectLines = (lines: string[]): PatchStyle | undefined => {
  const length = lines.length;
  let weak: PatchStyle | undefined;
  for (let i = 0; i < length; i++) {
    const line = chop(lines[i]);
    const next = i + 1 < length ? chop(lines[i + 1]) : undefined;
    if (isUnifiedMark(line, next)) return 'unified';
    if (isContextMark(line, next)) return 'context';
    if (weak) continue;
    if (NORMAL_CMD.test(line)) weak = 'normal';
    else if (ED_CMD.test(line)) weak = 'ed';
  }
  return weak;
};

/**
 * The style a patch is written in, as real `patch` guesses it: nothing declares
 * it and users pipe whatever they have.
 *
 * **A strong marker beats a weak one wherever it sits**, rather than the first
 * marker winning. `@@`, `diff --git`, `--- `/`+++ ` and `***************` cannot
 * be produced by accident; a bare `3a4` or `12d` can — prose, a table of
 * contents and a log line all say it — so normal and ed are only concluded from
 * a document that carries no unified or context marker at all.
 *
 * @param text A patch file, or anything a patch file was pasted into.
 * @returns The style, or `undefined` when nothing in the text looks like a patch.
 */
export const detect = (text: string): PatchStyle | undefined => detectLines(deindent(text.split('\n')));

/** Cursor over the patch text, one entry per line. */
class Reader {
  public i = 0;
  public readonly length: number;

  constructor(
    public readonly lines: string[],
    public readonly stripCr: boolean,
  ) {
    this.length = lines.length;
  }

  /** Structural view of a line, without the patch file's own terminator. */
  public at(offset = 0): string | undefined {
    const line = this.lines[this.i + offset];
    return line === undefined ? line : chop(line);
  }

  /** Content view: a CR is data here, unless the caller asked for it to go. */
  public content(): string {
    const line = this.lines[this.i] ?? '';
    return this.stripCr ? chop(line) : line;
  }
}

/**
 * One pass over one patch text. Every method either consumes input or reports,
 * and **nothing here throws**: a malformed hunk is a {@link ParseError} on the
 * file it was found in, which is what lets `patch` reject that hunk and keep the
 * rest — the behaviour POSIX requires and the one a `.rej` file is made of.
 */
class Parser {
  protected readonly files: FilePatch[] = [];
  protected file: FilePatch | undefined;
  /** `Index: name`, which on an old patch is the only name there is. */
  protected indexName: string | undefined;

  constructor(
    protected readonly r: Reader,
    protected readonly style: PatchStyle,
  ) {}

  /** The file hunks and errors attach to; a headerless patch gets an unnamed one. */
  protected current(): FilePatch {
    let file = this.file;
    if (!file) {
      const name = this.indexName ?? '';
      file = this.open(name, name);
    }
    return file;
  }

  protected open(oldName: string, newName: string, oldTime?: string, newTime?: string): FilePatch {
    const file = new FilePatch(oldName, newName, [], oldTime, newTime, undefined, this.style, [], this.indexName);
    // An `Index:` line announces the file that follows it and no other, which is
    // what keeps one at the top of a multi-file patch off every file after it.
    this.indexName = undefined;
    this.files.push(file);
    this.file = file;
    return file;
  }

  /** Clamped into the input, so an error can never name a line that is not there. */
  protected error(code: ParseErrorCode, message: string, index: number = this.r.i): void {
    const r = this.r;
    const at = index < r.length ? index : r.length - 1;
    const line = r.lines[at];
    this.current().errors.push(new ParseError(code, message, at + 1, line === undefined ? line : chop(line)));
  }

  /** A line the format requires, absent because the input is wrong or because it ran out. */
  protected missing(what: string): void {
    const eof = this.r.i >= this.r.length;
    this.error(eof ? 'truncated' : 'header', (eof ? 'the input ends before ' : 'expected ') + what);
  }

  /**
   * Adds a hunk, reporting one that overlaps the hunk before it. Ed scripts run
   * bottom-up — every address names the file as it was, which is what makes them
   * applicable at all — so their expected direction is the other one.
   */
  protected push(hunk: Hunk, at: number): void {
    const hunks = this.current().hunks;
    const prev = hunks[hunks.length - 1];
    if (prev) {
      const first = hunk.oldCount ? hunk.oldStart : hunk.oldStart + 1;
      const last = hunk.oldCount ? hunk.oldStart + hunk.oldCount - 1 : hunk.oldStart;
      const prevFirst = prev.oldCount ? prev.oldStart : prev.oldStart + 1;
      const prevLast = prev.oldCount ? prev.oldStart + prev.oldCount - 1 : prev.oldStart;
      if (this.style === 'ed' ? last >= prevFirst : first <= prevLast)
        this.error('overlap', 'hunk covers source lines the hunk before it already covered', at);
    }
    hunks.push(hunk);
  }

  /** `\ No newline at end of file`, which belongs to the line before it. */
  protected marker(lines: HunkLine[]): void {
    const r = this.r;
    const line = r.at();
    if (line === undefined || line.charCodeAt(0) !== 92) return;
    r.i++;
    const last = lines[lines.length - 1];
    if (last) last.noEol = true;
  }

  /** The `--- old` / `+++ new` pair, when the cursor is on it. */
  protected labels(): [string, string, string | undefined, string | undefined] | undefined {
    const r = this.r;
    const a = r.at();
    const b = r.at(1);
    if (a === undefined || b === undefined || !a.startsWith('--- ') || !b.startsWith('+++ ')) return undefined;
    r.i += 2;
    const [oldName, oldTime] = label(a.slice(4));
    const [newName, newTime] = label(b.slice(4));
    return [oldName, newName, oldTime, newTime];
  }

  /** The context-format `*** old` / `--- new` pair, which is not a `*** 1,3 ****` range. */
  protected starLabels(): [string, string, string | undefined, string | undefined] | undefined {
    const r = this.r;
    const a = r.at();
    const b = r.at(1);
    if (a === undefined || b === undefined || !a.startsWith('*** ') || !b.startsWith('--- ')) return undefined;
    if (CONTEXT_OLD.test(a)) return undefined;
    r.i += 2;
    const [oldName, oldTime] = label(a.slice(4));
    const [newName, newTime] = label(b.slice(4));
    return [oldName, newName, oldTime, newTime];
  }

  // ------------------------------------------------------------------- unified

  protected unifiedHunk(): void {
    const r = this.r;
    const at = r.i;
    const m = UNIFIED_HUNK.exec(r.at()!)!;
    r.i++;
    const oldStart = +m[1];
    const newStart = +m[3];
    const oldSaid = m[2] === undefined ? 1 : +m[2];
    const newSaid = m[4] === undefined ? 1 : +m[4];
    const lines: HunkLine[] = [];
    let oldLeft = oldSaid;
    let newLeft = newSaid;
    while (oldLeft > 0 || newLeft > 0) {
      const line = r.at();
      if (line === undefined) {
        this.error('truncated', 'the input ends inside a hunk body', at);
        break;
      }
      const flag = line[0];
      let op: HUNK_OP_TYPE;
      if (flag === '-') {
        op = HUNK_OP_TYPE.DEL;
        oldLeft--;
      } else if (flag === '+') {
        op = HUNK_OP_TYPE.INS;
        newLeft--;
      } else if (flag === ' ' || line === '') {
        // An empty line is a context line whose single space was stripped, which
        // is what a mail client, a wiki and a copy-paste all do to a patch.
        op = HUNK_OP_TYPE.EQL;
        oldLeft--;
        newLeft--;
      } else if (flag === '\\') {
        r.i++;
        continue;
      } else {
        // A body that ends early on the next hunk or the next file is short, not
        // corrupt: the count check below is the whole report it needs.
        if (!UNIFIED_HUNK.test(line) && !line.startsWith('diff --git '))
          this.error('body', 'a hunk body line starts with ' + JSON.stringify(flag), r.i);
        break;
      }
      lines.push(new HunkLine(op, r.content().slice(1)));
      r.i++;
      this.marker(lines);
    }
    const next = r.at();
    if (next !== undefined && (next[0] === '-' || next[0] === '+') && !isDivider(next))
      this.error('count', 'more body lines follow than the hunk header claims', r.i);
    this.hunk(lines, oldStart, oldSaid, newStart, newSaid, trailer(m[5]), at);
  }

  // -------------------------------------------------------------------- normal

  protected normalHunk(): void {
    const r = this.r;
    const at = r.i;
    const m = NORMAL_CMD.exec(r.at()!)!;
    r.i++;
    const letter = m[3];
    const oldStart = +m[1];
    const newStart = +m[4];
    const oldSaid = letter === 'a' ? 0 : (m[2] === undefined ? oldStart : +m[2]) - oldStart + 1;
    const newSaid = letter === 'd' ? 0 : (m[5] === undefined ? newStart : +m[5]) - newStart + 1;
    if (oldSaid < 0 || newSaid < 0) {
      this.error('range', 'the command names a range that ends before it begins', at);
      return;
    }
    if ((letter === 'a' && m[2] !== undefined) || (letter === 'd' && m[5] !== undefined))
      this.error('range', 'the empty side of an add or delete takes one address', at);
    const lines: HunkLine[] = [];
    let ok = this.side(lines, oldSaid, '<', HUNK_OP_TYPE.DEL, at);
    if (ok && letter === 'c') {
      if (r.at() === '---') r.i++;
      else {
        this.missing('the --- separator between the two sides of a change');
        ok = false;
      }
    }
    if (ok) ok = this.side(lines, newSaid, '>', HUNK_OP_TYPE.INS, at);
    this.hunk(lines, oldStart, ok ? oldSaid : SAID.BROKEN, newStart, ok ? newSaid : SAID.BROKEN, undefined, at);
  }

  /** One side of a normal hunk: exactly `count` lines, each flagged and space-separated. */
  protected side(lines: HunkLine[], count: number, flag: string, op: HUNK_OP_TYPE, at: number): boolean {
    const r = this.r;
    for (let k = 0; k < count; k++) {
      const line = r.at();
      if (line === undefined) {
        this.error('truncated', 'the input ends inside a hunk body', at);
        return false;
      }
      if (line[0] !== flag) {
        this.error('body', 'expected a ' + JSON.stringify(flag) + ' line', r.i);
        return false;
      }
      lines.push(new HunkLine(op, r.content().slice(line.charCodeAt(1) === 32 ? 2 : 1)));
      r.i++;
      this.marker(lines);
    }
    return true;
  }

  // ------------------------------------------------------------------- context

  protected contextHunk(): void {
    const r = this.r;
    const at = r.i;
    const section = trailer(CONTEXT_SEP.exec(r.at()!)![1]);
    r.i++;
    const om = CONTEXT_OLD.exec(r.at() ?? '');
    if (!om) {
      this.missing('a *** range line after the hunk separator');
      return;
    }
    r.i++;
    const oldStart = +om[1];
    // A single number is what GNU writes for a one-line range AND for an empty
    // one, so it says nothing: -1 means "the body decides", which it always can.
    const oldSaid = om[2] === undefined ? SAID.AMBIGUOUS : +om[2] - oldStart + 1;
    const oldBody = this.contextBody(oldSaid < 0 ? 1 : oldSaid, false);
    const nm = CONTEXT_NEW.exec(r.at() ?? '');
    if (!nm) {
      this.missing('a --- range line after the old side of the hunk');
      return;
    }
    r.i++;
    const newStart = +nm[1];
    const newSaid = nm[2] === undefined ? SAID.AMBIGUOUS : +nm[2] - newStart + 1;
    const newBody = this.contextBody(newSaid < 0 ? 1 : newSaid, true);
    const lines = this.merge(oldBody, newBody, at);
    this.hunk(lines, oldStart, oldSaid, newStart, newSaid, section, at);
  }

  /**
   * One side's body, or `undefined` when that side prints none — which is what a
   * side with no change of its own does, and is why the other side has to be
   * able to reconstruct it.
   *
   * Read greedily rather than by the range's count: the count is the thing that
   * cannot be trusted here. `expected` only settles whether an empty line is an
   * empty context line whose flag was stripped or the end of the body.
   */
  protected contextBody(expected: number, isNew: boolean): HunkLine[] | undefined {
    const r = this.r;
    if (!isContextBody(r.at())) return undefined;
    const lines: HunkLine[] = [];
    for (;;) {
      const line = r.at();
      if (line === undefined) break;
      if (!isContextBody(line)) {
        if (line !== '' || lines.length >= expected) break;
        lines.push(new HunkLine(HUNK_OP_TYPE.EQL, ''));
        r.i++;
        this.marker(lines);
        continue;
      }
      const flag = line[0];
      if (flag === (isNew ? '-' : '+')) this.error('body', 'the wrong side of the hunk carries a ' + flag, r.i);
      const op = flag === ' ' ? HUNK_OP_TYPE.EQL : isNew ? HUNK_OP_TYPE.INS : HUNK_OP_TYPE.DEL;
      lines.push(new HunkLine(op, r.content().slice(2)));
      r.i++;
      this.marker(lines);
    }
    return lines;
  }

  /**
   * The two printed sides back into one line sequence. Context lines pair up in
   * order, and between two of them the old side's changes come first and the
   * new side's follow — the order every writer emits and the only one that
   * reproduces the hunk it was written from.
   */
  protected merge(old: HunkLine[] | undefined, fresh: HunkLine[] | undefined, at: number): HunkLine[] {
    if (!old || !fresh) {
      if (old || fresh) return (old ?? fresh)!;
      this.error('body', 'a context hunk that prints neither of its sides', at);
      return [];
    }
    const lines: HunkLine[] = [];
    const oldLength = old.length;
    const freshLength = fresh.length;
    let i = 0;
    let j = 0;
    while (i < oldLength || j < freshLength) {
      const o = old[i];
      const n = fresh[j];
      if (o && n && o.op === HUNK_OP_TYPE.EQL && n.op === HUNK_OP_TYPE.EQL) {
        if (n.noEol) o.noEol = true;
        lines.push(o);
        i++;
        j++;
        continue;
      }
      const before = lines.length;
      while (i < oldLength && old[i].op !== HUNK_OP_TYPE.EQL) lines.push(old[i++]);
      while (j < freshLength && fresh[j].op !== HUNK_OP_TYPE.EQL) lines.push(fresh[j++]);
      if (lines.length > before) continue;
      // One side has an unchanged line the other does not: the bodies disagree,
      // and the loop still has to advance.
      this.error('count', 'the two sides of the context hunk do not line up', at);
      lines.push(o ?? n);
      if (o) i++;
      else j++;
    }
    return lines;
  }

  // ----------------------------------------------------------------------- ed

  protected edHunk(): void {
    const r = this.r;
    const at = r.i;
    const m = ED_CMD.exec(r.at()!)!;
    r.i++;
    const letter = m[3];
    const start = +m[1];
    const end = m[2] === undefined ? start : +m[2];
    if (end < start) {
      this.error('range', 'the command names a range that ends before it begins', at);
      return;
    }
    if (letter === 'a' && m[2] !== undefined) this.error('range', 'an append takes one address', at);
    const oldCount = letter === 'a' ? 0 : end - start + 1;
    if (oldCount && !start) this.error('range', 'line numbers are 1-based', at);
    const lines: HunkLine[] = [];
    if (letter !== 'd') this.edBlock(lines, at);
    // `newStart` is filled in by `finishEd`: an ed script carries no destination
    // numbers at all, and the deleted text is not in the script either - the
    // hunk carries `oldCount` and no DEL lines, which is what a blind delete is.
    this.push(new Hunk(start, oldCount, 0, lines.length, lines), at);
  }

  /**
   * An insert block, up to the `.` that closes it. A line whose whole content is
   * `.` cannot be written literally, so it is written `..`, the block is closed
   * and `s/.//` takes the extra dot back off; a line whose content really is
   * `..` is written as itself, and only what follows tells the two apart.
   */
  protected edBlock(lines: HunkLine[], at: number): void {
    const r = this.r;
    let inserting = true;
    for (;;) {
      if (!inserting) {
        if (r.at() !== 'a') return;
        r.i++;
        inserting = true;
      }
      const line = r.at();
      if (line === undefined) {
        this.error('truncated', 'the input ends inside an ed insert block', at);
        return;
      }
      if (line === '.') {
        r.i++;
        return;
      }
      if (line === '..' && r.at(1) === '.' && r.at(2) === 's/.//') {
        lines.push(new HunkLine(HUNK_OP_TYPE.INS, '.'));
        r.i += 3;
        inserting = false;
        continue;
      }
      lines.push(new HunkLine(HUNK_OP_TYPE.INS, r.content()));
      r.i++;
    }
  }

  // -------------------------------------------------------------------- shared

  /**
   * Builds the hunk from what the body actually held, and reports a header that
   * disagrees with it. The content wins: a header claiming `-1,5` over four
   * lines is a real thing in a hand-edited patch, and trusting it silently is
   * how a patch applies to the wrong place.
   *
   * @param oldSaid Count the header claimed, or `-1` when it could not say.
   */
  protected hunk(
    lines: HunkLine[],
    oldStart: number,
    oldSaid: number,
    newStart: number,
    newSaid: number,
    section: string | undefined,
    at: number,
  ): void {
    let oldCount = 0;
    let newCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const op = lines[i].op;
      if (op !== HUNK_OP_TYPE.INS) oldCount++;
      if (op !== HUNK_OP_TYPE.DEL) newCount++;
    }
    // A single-number range says 1 or 0 and means either, so it only disagrees
    // once the body holds more than one line.
    const oldOff = oldSaid >= 0 ? oldCount !== oldSaid : oldSaid === SAID.AMBIGUOUS && oldCount > 1;
    const newOff = newSaid >= 0 ? newCount !== newSaid : newSaid === SAID.AMBIGUOUS && newCount > 1;
    if (oldOff || newOff)
      this.error(
        'count',
        'the hunk header says ' +
          (oldSaid < 0 ? '?' : oldSaid) +
          ' and ' +
          (newSaid < 0 ? '?' : newSaid) +
          ' lines, the body carries ' +
          oldCount +
          ' and ' +
          newCount,
        at,
      );
    if ((oldCount && !oldStart) || (newCount && !newStart)) this.error('range', 'line numbers are 1-based', at);
    this.push(new Hunk(oldStart, oldCount, newStart, newCount, lines, section), at);
  }

  // ------------------------------------------------------------------ the file

  /** `diff --git a/x b/y` and the extended header lines that may follow it. */
  protected git(): void {
    const r = this.r;
    const [oldName, newName] = gitNames(r.at()!.slice(11));
    const file = this.open(oldName, newName);
    const meta: GitMeta = {};
    file.meta = meta;
    r.i++;
    for (; r.i < r.length; r.i++) {
      const line = r.at()!;
      if (line.startsWith('old mode ')) meta.oldMode = line.slice(9);
      else if (line.startsWith('new mode ')) meta.newMode = line.slice(9);
      else if (line.startsWith('new file mode ')) meta.newFileMode = line.slice(14);
      else if (line.startsWith('deleted file mode ')) meta.deletedFileMode = line.slice(18);
      else if (line.startsWith('rename from ')) meta.renameFrom = line.slice(12);
      else if (line.startsWith('rename to ')) meta.renameTo = line.slice(10);
      else if (line.startsWith('copy from ')) meta.copyFrom = line.slice(10);
      else if (line.startsWith('copy to ')) meta.copyTo = line.slice(8);
      else if (line.startsWith('similarity index ')) meta.similarity = parseInt(line.slice(17), 10);
      else if (line.startsWith('dissimilarity index ')) meta.dissimilarity = parseInt(line.slice(20), 10);
      else if (line.startsWith('index ')) {
        const m = /^index ([0-9a-f]+)\.\.([0-9a-f]+)(?: (\d+))?$/.exec(line);
        if (!m) break;
        meta.oldHash = m[1];
        meta.newHash = m[2];
        if (m[3] !== undefined) meta.indexMode = m[3];
      } else if (line === 'GIT binary patch' || line.startsWith('Binary files ') || line.startsWith('Files ')) {
        meta.binary = true;
        this.error('binary', 'a binary patch, which this package does not decode', r.i);
        // The payload is base85 with no header of its own, so the next file is
        // the only thing that reliably ends it.
        while (r.i < r.length && !r.at()!.startsWith('diff --git ')) r.i++;
        return;
      } else break;
    }
    const names = this.labels();
    if (!names) return;
    file.oldName = names[0];
    file.newName = names[1];
    file.oldTime = names[2];
    file.newTime = names[3];
  }

  /**
   * `diff -r`'s echo line, which is how a multi-file patch in a style with no
   * header of its own says the next file starts. Only normal and ed need it —
   * unified and context carry their own names, and a prose line beginning
   * "diff " would otherwise name a file.
   */
  protected echoed(line: string): void {
    const words = line.split(' ');
    this.r.i++;
    if (words.length < 3) return;
    this.open(words[words.length - 2], words[words.length - 1]);
  }

  public run(): FilePatch[] {
    const r = this.r;
    const style = this.style;
    while (r.i < r.length) {
      const at = r.i;
      const line = r.at()!;
      if (line.startsWith('diff --git ')) this.git();
      else if (style === 'unified' && UNIFIED_HUNK.test(line)) this.unifiedHunk();
      else if (style === 'context' && CONTEXT_SEP.test(line)) this.contextHunk();
      else if (style === 'normal' && NORMAL_CMD.test(line)) this.normalHunk();
      else if (style === 'ed' && ED_CMD.test(line)) this.edHunk();
      // The one shape of junk that is never junk: nothing writes `@@` by accident.
      else if (style === 'unified' && line.startsWith('@@'))
        this.error('header', 'a @@ line that is not a hunk header');
      else if (line.startsWith('Index: ')) {
        this.indexName = line.slice(7);
        this.file = undefined;
        r.i++;
      } else if (line.startsWith('diff ') && (style === 'normal' || style === 'ed')) this.echoed(line);
      else if (style === 'context') {
        const names = this.starLabels();
        if (names) this.open(...names);
      } else if (style === 'unified') {
        const names = this.labels();
        if (names) this.open(...names);
      }
      // Junk, and junk is the input distribution: patches are pasted into mail
      // bodies, issue threads and agent transcripts. Advancing here is also what
      // makes the loop structurally unable to stall on input nothing recognized.
      if (r.i === at) r.i++;
    }
    if (style === 'ed') for (const file of this.files) this.finishEd(file);
    return this.files.filter((file) => file.hunks.length || file.meta || file.errors.length);
  }

  /**
   * An ed script is written last hunk first, because it is evaluated as it
   * applies; its addresses therefore all name the original file, and putting the
   * hunks back in file order costs a reverse. The destination numbers are not in
   * the script at all and are derived from the running delta, which is the same
   * arithmetic a unified diff of the same edit prints.
   */
  protected finishEd(file: FilePatch): void {
    const hunks = file.hunks;
    const length = hunks.length;
    let descending = true;
    for (let i = 1; i < length; i++)
      if (hunks[i].oldStart > hunks[i - 1].oldStart) {
        descending = false;
        break;
      }
    if (descending) hunks.reverse();
    let delta = 0;
    for (let i = 0; i < length; i++) {
      const hunk = hunks[i];
      hunk.newStart = hunk.newCount
        ? (hunk.oldCount ? hunk.oldStart : hunk.oldStart + 1) + delta
        : hunk.oldStart - 1 + delta;
      delta += hunk.newCount - hunk.oldCount;
    }
  }
}

/**
 * Reads a patch file into one {@link FilePatch} per file it describes — the
 * half of this module that makes the package useful to a consumer that never
 * diffs anything: a review UI, an applier, a CI check.
 *
 * The style is auto-detected ({@link detect}) unless {@link ParseOptions.style}
 * says otherwise, a blank prefix shared by every line is removed before
 * anything else (POSIX; the shape a mail body or a wiki produces), a C-quoted
 * header name is unquoted, garbage around the hunks is skipped, and **nothing
 * throws**:
 * everything malformed lands in {@link FilePatch.errors} with the line it was
 * found on, so a caller can reject one hunk and take the rest.
 *
 * Three things the formats themselves cannot carry, which no caller should
 * expect back:
 *
 * - **An ed script has no deleted text and no destination line numbers.** Hunks
 *   read from one carry `oldCount` with no `DEL` lines — a blind delete, which
 *   is what applying an ed script is — and `newStart` derived from the running
 *   delta rather than read.
 * - **Neither `ed` nor `rcs` can spell a missing final newline**, so it does not
 *   come back from them. Every other style round-trips it.
 * - **A file header with no hunks is not a file.** An empty `FilePatch` is
 *   dropped unless it carries git metadata or an error, which is what keeps a
 *   `--- `/`+++ ` pair quoted in prose from becoming a patch.
 *
 * @param text A patch file, or anything one was pasted into.
 * @param opts Style override and CR handling.
 * @returns One entry per file the patch touches, in the order they appear.
 */
export const parse = (text: string, opts?: ParseOptions): FilePatch[] => {
  const raw = text.split('\n');
  if (raw[raw.length - 1] === '') raw.pop();
  const lines = deindent(raw);
  const style = opts?.style ?? detectLines(lines);
  if (!style) return [];
  return new Parser(new Reader(lines, !!opts?.stripTrailingCr), style).run();
};
