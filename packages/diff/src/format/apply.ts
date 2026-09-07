import {type FilePatch, Hunk, HUNK_OP_TYPE, HunkLine} from './types';

/**
 * Why a hunk was not applied.
 *
 * - `context` — nothing the search reached matched it, at any fuzz level.
 * - `reversed` — it does not apply, but its inverse does: the patch was already
 *   applied, or handed over backwards. Detected, never acted on.
 * - `eol` — it would have matched if the two sides agreed on line terminators.
 *   A CRLF patch of an LF file is the most common real-world apply failure
 *   there is, and saying so beats a context mismatch nobody can read.
 * - `range` — it names source lines the file does not have. Only a blind delete
 *   can fail this way; everything else fails to match instead.
 * - `limit` — the search spent its budget. Not a claim that nothing matches.
 */
export type ApplyRejectCode = 'context' | 'reversed' | 'eol' | 'range' | 'limit';

/** A hunk that went in, and where it ended up. */
export class AppliedHunk {
  constructor(
    public readonly hunk: Hunk,
    /** 1-based position among the file's hunks, as `patch` numbers them. */
    public readonly index: number,
    /** 1-based line of the **result** the hunk landed on, `patch`'s "succeeded at". */
    public readonly line: number,
    /** Lines from where the hunk said it would go; negative is earlier. */
    public readonly offset: number,
    /** Context lines ignored at each end to make it match. */
    public readonly fuzz: number,
  ) {}
}

/** A hunk that did not go in. Carries the hunk itself, which is what a `.rej` file is. */
export class RejectedHunk {
  constructor(
    public readonly hunk: Hunk,
    /** 1-based position among the file's hunks, as `patch` numbers them. */
    public readonly index: number,
    /** 1-based **source** line it was looked for at, running offset included. */
    public readonly line: number,
    public readonly code: ApplyRejectCode,
  ) {}
}

/** Options of {@link apply}. */
export interface ApplyOptions {
  /**
   * Apply every hunk backwards, `patch -R`. The hunks reported back are the
   * inverted ones — they are what was applied, and what a `.rej` file has to
   * hold for the result to be re-appliable.
   */
  reverse?: boolean;
  /**
   * Fuzz level to try first, `0` by default: how much leading and trailing
   * context to ignore on the first attempt. It never skips the exact attempt
   * on a hunk that carries less context than this asks for; `patch -F` is
   * {@link maxFuzz}, not this.
   */
  fuzz?: number;
  /**
   * Most context lines that may be ignored at each end of a hunk, `patch -F`,
   * `2` by default. Capped per hunk at **half the hunk's context** and at the
   * leading run, and at nothing at all where a side carries no context; see
   * {@link Apply.cap}, whose rule is `patch`'s, measured. Fuzz can never reach a
   * line the hunk *changes* — that is structural here, not a policy — so
   * raising it risks placing a hunk in the wrong region, never corrupting the
   * region it lands in.
   */
  maxFuzz?: number;
  /**
   * Compare lines ignoring how much whitespace they carry, `patch -l`. A run of
   * blanks on one side matches a run of blanks on the other whatever their
   * lengths, trailing blanks are ignored, and everything else still has to be
   * equal — POSIX's "any sequence of <blank> characters in the difference
   * script shall match any sequence of <blank> characters in the input file.
   * Other characters shall be matched exactly."
   *
   * Off by default, and it relaxes *matching* only: a context line is still
   * copied from the file, so a hunk placed this way keeps the file's own
   * indentation rather than the patch's.
   */
  ignoreWhitespace?: boolean;
  /**
   * Lines the search may travel from where a hunk says it goes, `4096` by
   * default. GNU searches the whole file; a bound is what keeps a large file
   * full of near-misses from costing O(lines x hunk) per hunk. Realistic drift
   * is two orders of magnitude below this.
   */
  maxOffset?: number;
  /**
   * Line comparisons **one search** may spend, `1 << 22` by default.
   * Deterministic: the same input costs the same on any machine, no clock is
   * read. A hunk whose search runs out is rejected with `limit` rather than
   * searched further, which is the difference between a slow apply and one that
   * does not return.
   *
   * Per search, not per call: a hunk spends one on its exact attempt, one on the
   * reverse probe, one per fuzz level and one on the line-ending probe, so a
   * whole `apply` is bounded by `hunks x (maxFuzz + 3) x maxCost`. A patch of a
   * thousand hunks that all fail against a large file reaches seconds, still
   * bounded and still deterministic. Lower it if that matters more than finding
   * a hunk that drifted a long way.
   */
  maxCost?: number;
}

/** What {@link apply} produced. */
export interface ApplyResult {
  /** The patched text. Unchanged where hunks were rejected. */
  text: string;
  applied: AppliedHunk[];
  /** Whole hunks, never partial ones: a hunk that did not fit changed nothing. */
  rejected: RejectedHunk[];
  /** Every hunk failed, and every one of them applies in reverse. */
  alreadyApplied: boolean;
}

/** Lines the search travels by default. */
const MAX_OFFSET = 4096;
/** Line comparisons one search spends by default. */
const MAX_COST = 1 << 22;

/** A trailing CR, which is all a CRLF patch of an LF file differs by. */
const chop = (line: string): string => (line.endsWith('\r') ? line.slice(0, -1) : line);

/** Space or tab: POSIX's <blank>, and all {@link ApplyOptions.ignoreWhitespace} relaxes. */
const blank = (code: number): boolean => code === 32 || code === 9;

/**
 * Whether two lines are the same once the *amount* of whitespace is ignored,
 * {@link ApplyOptions.ignoreWhitespace}. A run of blanks has to face a run of
 * blanks — `a b` does not match `ab`, which is POSIX's rule and GNU's `similar`
 * — except at the end of a line, where trailing blanks on either side go.
 *
 * Walks both strings once and allocates nothing: this runs per line comparison,
 * inside the search {@link ApplyOptions.maxCost} bounds.
 */
const alike = (a: string, b: string): boolean => {
  const al = a.length;
  const bl = b.length;
  let i = 0;
  let j = 0;
  for (;;) {
    const ba = i < al && blank(a.charCodeAt(i));
    const bb = j < bl && blank(b.charCodeAt(j));
    if (ba || bb) {
      while (i < al && blank(a.charCodeAt(i))) i++;
      while (j < bl && blank(b.charCodeAt(j))) j++;
      // Both lines ended in the run: they differed by trailing blanks only.
      if (i >= al && j >= bl) return true;
      if (!ba || !bb) return false;
      continue;
    }
    if (i >= al || j >= bl) return i >= al && j >= bl;
    if (a.charCodeAt(i) !== b.charCodeAt(j)) return false;
    i++;
    j++;
  }
};

/**
 * The file boundary a hunk's *missing* context names. A hunk that carries
 * context somewhere but none at one end is missing it because the file stopped
 * there, so that end is not a place the hunk may drift away from. A hunk with no
 * context at all (`-U0`, a whole-file replacement) names no boundary and floats.
 *
 * The two ends are not symmetric, which is measured rather than reasoned:
 * `patch` pins a hunk with no trailing context to the end of the file whatever
 * else it carries, but lets one with no *leading* context drift as soon as it
 * has a run of context between two of its changes to be placed by. This follows
 * `patch`. **`git apply` is stricter** and does not make that exception —
 * measured byte-identically against Apple `patch 2.0` and git 2.50, it refuses
 * to move a hunk off line 1 whenever the hunk has no leading context, interior
 * run or not. The two references agree on every shape where this rule fires and
 * differ on the one where it does not; see the `boundary-anchor` entry in
 * `probes/drift.mjs`.
 */
const enum ANCHOR {
  /** Context at both ends, none at all, or enough of it inside: the search is free. */
  FREE = 0,
  /** No leading context and none inside: the old side starts at the file's first line. */
  START = 1,
  /** No trailing context: the old side has to end at the file's last line. */
  END = 2,
}

/**
 * A hunk's old side, cut where fuzz is allowed to bite: leading context, the
 * span from the first changed line to the last, trailing context.
 *
 * **A fuzz level can only shorten `pre` and `post`.** No expression in this
 * file drops a line of `core`, which is the whole safety property of fuzz —
 * relaxing an inner line applies a hunk to text it was not written for and
 * corrupts the file silently, where relaxing context can only place the hunk
 * somewhere else.
 */
class Pattern {
  /** Source lines the hunk covers: `oldCount`, unless it is {@link blind}. */
  public readonly length: number;

  constructor(
    public readonly pre: string[],
    /** Old-side text from the first changed line to the last, context included. */
    public readonly core: string[],
    public readonly post: string[],
    /** Index into `Hunk.lines` where the core span begins. */
    public readonly from: number,
    /** Index into `Hunk.lines` where the core span ends. */
    public readonly to: number,
    /**
     * The hunk covers source lines and holds **no old-side text at all**, so
     * there is nothing to match: an ed script's deletions, which carry a count
     * and never the lines. A hunk holding *some* old-side text is not blind
     * however much its `oldCount` disagrees — a header that outruns its body is
     * a hand-written or truncated patch, and deleting the lines it names
     * unmatched would remove text nothing in the patch ever showed. The body
     * wins, as it does in the parser.
     */
    public readonly blind: boolean,
    /** The file boundary the hunk's missing context pins it to. */
    public readonly anchor: ANCHOR,
  ) {
    this.length = pre.length + core.length + post.length;
  }
}

const pattern = (hunk: Hunk): Pattern => {
  const lines = hunk.lines;
  const length = lines.length;
  let from = 0;
  while (from < length && lines[from].op === HUNK_OP_TYPE.EQL) from++;
  let to = length;
  while (to > from && lines[to - 1].op === HUNK_OP_TYPE.EQL) to--;
  const pre: string[] = [];
  for (let i = 0; i < from; i++) pre.push(lines[i].text);
  const core: string[] = [];
  for (let i = from; i < to; i++) if (lines[i].op !== HUNK_OP_TYPE.INS) core.push(lines[i].text);
  const post: string[] = [];
  for (let i = to; i < length; i++) post.push(lines[i].text);
  // Context anywhere is what makes a missing end meaningful. See {@link ANCHOR}
  // for why the head takes the interior run into account and the tail does not.
  let interior = false;
  for (let i = from; !interior && i < to; i++) if (lines[i].op === HUNK_OP_TYPE.EQL) interior = true;
  const anchor = post.length
    ? pre.length || interior
      ? ANCHOR.FREE
      : ANCHOR.START
    : pre.length || interior
      ? ANCHOR.END
      : ANCHOR.FREE;
  const old = pre.length + core.length + post.length;
  return new Pattern(pre, core, post, from, to, !old && hunk.oldCount > 0, anchor);
};

/**
 * The hunk that undoes this one: every line's side swapped, and the two ranges
 * with it. Line order is untouched, so both sides keep the order they had.
 */
export const invertHunk = (hunk: Hunk): Hunk => {
  const lines = hunk.lines;
  const length = lines.length;
  const out: HunkLine[] = [];
  for (let i = 0; i < length; i++) {
    const line = lines[i];
    out.push(new HunkLine(-line.op as HUNK_OP_TYPE, line.text, line.noEol));
  }
  return new Hunk(hunk.newStart, hunk.newCount, hunk.oldStart, hunk.oldCount, out, hunk.section);
};

/** Every hunk of a patch inverted, in place order, which `patch -R` applies. */
export const invertHunks = (hunks: Hunk[]): Hunk[] => {
  const out: Hunk[] = [];
  const length = hunks.length;
  for (let i = 0; i < length; i++) out.push(invertHunk(hunks[i]));
  return out;
};

/**
 * One `apply` call. Hunks are placed in file order, each searched for from
 * where the one before it landed, and the output is built as the source is
 * walked once — a hunk can only be placed at or after the end of the hunk
 * before it, which is what makes a single pass enough.
 */
class Apply {
  protected readonly src: string[];
  protected readonly srcNoEol: boolean;
  protected readonly out: string[] = [];
  protected readonly applied: AppliedHunk[] = [];
  protected readonly rejected: RejectedHunk[] = [];
  /** Source cursor: every line before it is copied, deleted or replaced. */
  protected si = 0;
  /** Whether what `out` holds ends the file without a newline. */
  protected noEol = false;
  /** First source line a hunk may still be placed at. */
  protected frozen = 0;
  /** Lines of drift the hunks placed so far have accumulated. */
  protected offset = 0;
  /** Line comparisons left in the current search. */
  protected budget = 0;
  /** Whether a trailing CR is ignored while comparing: the line-ending retry. */
  protected loose = false;
  /** Whether the amount of whitespace is ignored while comparing, `patch -l`. */
  protected readonly lax: boolean;
  protected readonly maxOffset: number;
  protected readonly maxCost: number;
  protected readonly maxFuzz: number;
  protected readonly fuzz: number;

  constructor(text: string, opts: ApplyOptions | undefined) {
    const noEol = text !== '' && !text.endsWith('\n');
    this.src = text === '' ? [] : (noEol ? text : text.slice(0, -1)).split('\n');
    this.srcNoEol = noEol;
    // Clamped, not validated, as `hunks()` clamps its context width: a negative
    // fuzz would slice *into* the core, and a negative radius or budget would
    // otherwise read as unbounded. Everything here must terminate on any input.
    const fuzz = opts?.fuzz ?? 0;
    const maxFuzz = opts?.maxFuzz ?? 2;
    const maxOffset = opts?.maxOffset ?? MAX_OFFSET;
    const maxCost = opts?.maxCost ?? MAX_COST;
    this.lax = !!opts?.ignoreWhitespace;
    this.fuzz = fuzz > 0 ? Math.floor(fuzz) : 0;
    this.maxFuzz = maxFuzz > 0 ? Math.floor(maxFuzz) : 0;
    this.maxOffset = maxOffset > 0 ? Math.floor(maxOffset) : 0;
    this.maxCost = maxCost > 0 ? Math.floor(maxCost) : 0;
  }

  /** One line comparison, and one unit of the search budget. */
  protected same(a: string, b: string): boolean {
    this.budget--;
    if (this.loose) {
      a = chop(a);
      b = chop(b);
    }
    return a === b || (this.lax && alike(a, b));
  }

  /**
   * Whether the hunk's old side sits at source line `at` (0-based), ignoring
   * `preTrim` leading and `postTrim` trailing context lines. The core is
   * compared in full, always; see {@link Pattern}.
   */
  protected match(p: Pattern, at: number, preTrim: number, postTrim: number): boolean {
    const src = this.src;
    const pre = p.pre;
    const core = p.core;
    const post = p.post;
    const preLength = pre.length;
    const coreLength = core.length;
    const postLength = post.length - postTrim;
    let i = at + preTrim;
    for (let k = preTrim; k < preLength; k++) if (!this.same(src[i++], pre[k])) return false;
    for (let k = 0; k < coreLength; k++) if (!this.same(src[i++], core[k])) return false;
    for (let k = 0; k < postLength; k++) if (!this.same(src[i++], post[k])) return false;
    return true;
  }

  /**
   * The highest fuzz level this hunk may be tried at: **half its context**,
   * never more than the leading run, and none at all where a side carries no
   * context. `patch`'s rule, measured rather than reasoned — the whole accepted
   * region of (leading, trailing) lines it will ignore was swept over a 6x6
   * matrix of context shapes, and it is a rectangle whose corner this is.
   *
   * The two ends are not symmetric: a 3+1 hunk fuzzes to 2, a 1+3 hunk only to
   * 1. Both measured directly. The bound that matters is that half a hunk's
   * context can go and no more, so a hunk with context on both sides always
   * keeps some of it — the alternative, the larger side, strips the smaller one
   * away entirely and places the hunk by whatever is left.
   */
  protected cap(pre: number, post: number): number {
    if (!pre || !post) return 0;
    const half = (pre + post) >> 1;
    const context = pre < half ? pre : half;
    return this.maxFuzz < context ? this.maxFuzz : context;
  }

  /**
   * The one source line an anchored hunk may sit at, or `-1` when it floats.
   * See {@link ANCHOR}.
   */
  protected anchor(p: Pattern): number {
    const anchor = p.anchor;
    return anchor === ANCHOR.END ? this.src.length - p.length : anchor === ANCHOR.START ? 0 : -1;
  }

  /**
   * Where the hunk applies, searched outward from `guess` — later before
   * earlier at each distance, which is GNU's order and settles the tie on a
   * file that drifted both ways — or `-1`. An `anchor` of `0` or more is the
   * only line it may occupy at all, so there is nothing to search.
   *
   * Both the radius and the comparison budget are bounded. An unbounded outward
   * search costs O(lines x hunk) for every hunk that fails, which on a large
   * file with many failing hunks is the quadratic this engine must not have.
   */
  protected locate(p: Pattern, guess: number, preTrim: number, postTrim: number, anchor: number): number {
    const frozen = this.frozen;
    // A fuzz level that trimmed away the last line the hunk had to go on leaves
    // nothing to compare, and an empty pattern matches everywhere: that is not
    // a placement, it is the absence of one. A hunk that carries no old side to
    // begin with — a zero-context insertion — is a different thing and does
    // apply where it says it does, as it does in `patch`.
    if (p.length && p.length === preTrim + postTrim) return -1;
    // The line the hunk names may hang off the end of the file by whatever
    // trailing context the fuzz level dropped — `patch` tries that one whatever
    // the file's length, so a hunk whose file lost its tail still applies where
    // it says it does. Positions the search moves *up* to may not, which is
    // what stops a fuzzed hunk sliding down past the last line of a file that
    // shrank; positions below it are bounded by `frozen` alone, as in `patch`.
    const fits = this.src.length - p.length;
    const maxAt = fits + postTrim;
    if (maxAt < frozen) return -1;
    if (anchor >= 0) {
      if (anchor < frozen || anchor > maxAt) return -1;
      const away = anchor > guess ? anchor - guess : guess - anchor;
      if (away > this.maxOffset) return -1;
      return this.match(p, anchor, preTrim, postTrim) ? anchor : -1;
    }
    // Clamped into the file, not just above it: a hunk that names a line past
    // the end of a shorter file searches back from the last position it fits
    // at, and every position tried is one the pattern can be compared against.
    if (guess < frozen) guess = frozen;
    else if (guess > maxAt) guess = maxAt;
    const radius = this.maxOffset;
    const up = Math.min(radius, fits > guess ? fits - guess : 0);
    const down = Math.min(radius, guess - frozen);
    const far = up > down ? up : down;
    for (let d = 0; d <= far; d++) {
      if (d <= up && this.match(p, guess + d, preTrim, postTrim)) return guess + d;
      if (d > 0 && d <= down && this.match(p, guess - d, preTrim, postTrim)) return guess - d;
      if (this.budget <= 0) break;
    }
    return -1;
  }

  /** Copies one source line, which is where a file's own final newline travels. */
  protected take(): void {
    const src = this.src;
    this.out.push(src[this.si++]);
    this.noEol = this.srcNoEol && this.si === src.length;
  }

  protected push(text: string, noEol: boolean): void {
    this.out.push(text);
    this.noEol = noEol;
  }

  protected copy(to: number): void {
    while (this.si < to) this.take();
  }

  /**
   * Writes one hunk at `where`, the source line its old side starts on.
   *
   * **Context lines are copied from the file, never from the hunk.** They are
   * equal wherever the hunk matched exactly, and where a fuzz level ignored
   * them they are not — and there the file's own lines are the ones to keep.
   */
  protected emit(hunk: Hunk, p: Pattern, where: number, at: number, fuzz: number, index: number): void {
    this.copy(where);
    const line = this.out.length + 1;
    this.copy(where + p.pre.length);
    const lines = hunk.lines;
    const to = p.to;
    for (let i = p.from; i < to; i++) {
      const l = lines[i];
      const op = l.op;
      if (op === HUNK_OP_TYPE.INS) this.push(l.text, l.noEol);
      else if (op === HUNK_OP_TYPE.EQL) this.take();
      else this.si++;
    }
    this.frozen = where + p.length;
    this.offset = where - at;
    this.applied.push(new AppliedHunk(hunk, index, line, this.offset, fuzz));
  }

  /**
   * A hunk that carries a count of source lines and no text for them: an ed
   * script's deletion, the one shape there is nothing to search for. It applies
   * where it says it does, running offset included, or not at all.
   */
  protected deleteBlind(hunk: Hunk, at: number, guess: number, index: number): void {
    const oldCount = hunk.oldCount;
    if (guess < this.frozen || guess + oldCount > this.src.length) {
      this.rejected.push(new RejectedHunk(hunk, index, guess + 1, 'range'));
      return;
    }
    this.copy(guess);
    const line = this.out.length + 1;
    this.si += oldCount;
    const lines = hunk.lines;
    const length = lines.length;
    for (let i = 0; i < length; i++) {
      const l = lines[i];
      if (l.op === HUNK_OP_TYPE.INS) this.push(l.text, l.noEol);
    }
    this.frozen = guess + oldCount;
    this.offset = guess - at;
    this.applied.push(new AppliedHunk(hunk, index, line, this.offset, 0));
  }

  protected place(hunk: Hunk, index: number): void {
    const p = pattern(hunk);
    // An empty old side numbers the line *before* it, so it inserts after that
    // line rather than at it. See {@link Hunk.oldStart}.
    const at = hunk.oldCount ? hunk.oldStart - 1 : hunk.oldStart;
    const guess = at + this.offset;
    if (p.blind) return this.deleteBlind(hunk, at, guess, index);
    const anchor = this.anchor(p);
    const preLength = p.pre.length;
    const postLength = p.post.length;
    const cap = this.cap(preLength, postLength);
    // Asking for more fuzz than the hunk can carry does not skip the exact
    // attempt: the level asked for does not exist on this hunk, so there is
    // nothing to start at. See {@link ApplyOptions.fuzz}.
    const first = this.fuzz <= cap ? this.fuzz : 0;
    let preTrim = first < preLength ? first : preLength;
    let postTrim = first < postLength ? first : postLength;
    this.budget = this.maxCost;
    let where = this.locate(p, guess, preTrim, postTrim, anchor);
    if (where >= 0) return this.emit(hunk, p, where, at, first, index);
    if (this.budget <= 0) {
      this.rejected.push(new RejectedHunk(hunk, index, guess + 1, 'limit'));
      return;
    }
    // Before any fuzz is spent: a patch already applied is not a hunk that needs
    // a looser match, it is a hunk that must not be applied again. Asking after
    // the fuzz loop instead lets a fuzz level place the hunk a second time and
    // report success, so a doubly-applied patch grows the file on every run and
    // the command never sees an `alreadyApplied` to prompt on. `patch` asks the
    // same question in the same place, at the fuzz level it started on.
    this.budget = this.maxCost;
    const inverse = pattern(invertHunk(hunk));
    // An inverse with nothing to match — a deletion at zero context — would
    // match everywhere and call every failure a reversal.
    //
    // **Asked under the same placement discipline as the forward search**, its
    // own anchor included. A `reversed` verdict is a claim about where this
    // hunk goes, and a probe allowed to roam where the forward search may not
    // makes that claim off a coincidence somewhere else in the file: it turns
    // "this hunk cannot be placed" into "this patch is already applied", which
    // a command acting on `alreadyApplied` reports as nothing to do. The
    // anchor is the inverse's own, since inverting changes the pattern's length
    // and so where a tail-anchored hunk has to sit.
    if (inverse.length && !inverse.blind && this.locate(inverse, guess, 0, 0, this.anchor(inverse)) >= 0) {
      this.rejected.push(new RejectedHunk(hunk, index, guess + 1, 'reversed'));
      return;
    }
    for (let f = first + 1; f <= cap; f++) {
      this.budget = this.maxCost;
      preTrim = f < preLength ? f : preLength;
      postTrim = f < postLength ? f : postLength;
      where = this.locate(p, guess, preTrim, postTrim, anchor);
      if (where >= 0) return this.emit(hunk, p, where, at, f, index);
      if (this.budget <= 0) {
        this.rejected.push(new RejectedHunk(hunk, index, guess + 1, 'limit'));
        return;
      }
    }
    // Failed at every level. One more failure is worth naming before "the
    // context does not match": a patch whose line terminators disagree with the
    // file's. Anchored, unlike the reverse probe above: unanchored it would find
    // the hunk's own exact match wherever the boundary rule just refused to put
    // it and call that a line-ending problem.
    this.budget = this.maxCost;
    this.loose = true;
    const eol = this.locate(p, guess, preTrim, postTrim, anchor) >= 0;
    this.loose = false;
    this.rejected.push(new RejectedHunk(hunk, index, guess + 1, eol ? 'eol' : 'context'));
  }

  public run(hunks: Hunk[]): ApplyResult {
    const length = hunks.length;
    for (let i = 0; i < length; i++) this.place(hunks[i], i + 1);
    this.copy(this.src.length);
    const out = this.out;
    const rejected = this.rejected;
    let reversed = length > 0 && rejected.length === length;
    for (let i = 0; reversed && i < length; i++) if (rejected[i].code !== 'reversed') reversed = false;
    return {
      text: out.length ? out.join('\n') + (this.noEol ? '' : '\n') : '',
      applied: this.applied,
      rejected,
      alreadyApplied: reversed,
    };
  }
}

/**
 * Applies one file's hunks to the text of that file — the engine `patch(1)` is
 * made of. Everything about *where* a hunk goes lives here, so the command that
 * calls it reads files, calls this, and writes what comes back.
 *
 * Pure: no I/O, no prompting, no filesystem, no clock. Nothing throws, and
 * nothing is applied partially — a hunk that does not fit lands in
 * {@link ApplyResult.rejected} whole, with the rest of the file still patched,
 * which is what a `.rej` file is made of.
 *
 * Five behaviours make it more than splicing lines in at the stated numbers,
 * because real patches are applied to files that have drifted:
 *
 * - **Offset search.** A hunk whose context does not match at the line it names
 *   is searched for outward from there, later before earlier at each distance.
 *   The offset is reported, and the next hunk starts its search from it, since
 *   drift accumulates down a file.
 * - **Boundary anchoring.** A hunk that carries context somewhere but none at
 *   one end is missing it because the file ended there, so it does not drift
 *   away from that end: it applies at the file's first or last line or not at
 *   all. A hunk with no context anywhere names no boundary and floats. See
 *   {@link ANCHOR}.
 * - **Fuzz.** A hunk that matches nowhere is retried ignoring up to
 *   {@link ApplyOptions.maxFuzz} lines of leading and trailing context. The
 *   lines it *changes* are always matched exactly.
 * - **Rejection.** Whole hunks, never partial ones, and the rest of the file
 *   still applies.
 * - **Reverse detection.** A hunk that fails where its inverse would apply is
 *   reported `reversed`; a patch whose every hunk is gives
 *   {@link ApplyResult.alreadyApplied}. Detecting it is this engine's job,
 *   prompting about it is the command's.
 *
 * Creating and deleting a file are text-level outcomes here: a patch against
 * `/dev/null` applies to `''`, and one that deletes every line returns `''`.
 * Which of those touches the filesystem is the command's rule, as is what to do
 * with a patch that carries {@link FilePatch.errors}.
 *
 * @param src Current text of the file, terminators and all.
 * @param patch One file's worth of hunks, from `format.parse` or built by hand.
 * @param opts Direction, fuzz, and the bounds on the search.
 * @returns The patched text, and what happened to every hunk.
 */
export const apply = (src: string, patch: FilePatch, opts?: ApplyOptions): ApplyResult =>
  new Apply(src, opts).run(opts?.reverse ? invertHunks(patch.hunks) : patch.hunks);
