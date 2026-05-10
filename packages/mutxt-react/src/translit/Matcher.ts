import type {TranslitScheme} from './types';

/**
 * One tick of input through the matcher.
 *
 * Bindings translate this into an edit on the document/input:
 *
 * 1. Delete `replaceTail` UTF-16 code units at the end of the previously emitted run.
 * 2. Insert `emit` at the caret.
 *
 * `replaceTail` is non-zero when the matcher rewrites a digraph that it
 * eager-committed on the previous keystroke (e.g. `s` → `с` is replaced with
 * `ш` when the user types the `h` of `sh`), and when a word boundary triggers
 * a `finalForms` swap on the previously-committed glyph.
 */
export interface MatchStep {
  replaceTail: number;
  emit: string;
  /** True when the matcher reset its state. */
  reset: boolean;
}

interface NormalizedRule {
  in: string;
  out: string;
  caseFold: boolean;
}

const isAsciiUpper = (c: number): boolean => c >= 65 && c <= 90;
const isAsciiLower = (c: number): boolean => c >= 97 && c <= 122;
const isAsciiDigit = (c: number): boolean => c >= 48 && c <= 57;

const upperFirst = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/**
 * Pre-compiled scheme: rules sorted longest-first, prefix set built up-front.
 * Compile once per scheme; share across matchers.
 */
export class CompiledScheme {
  public readonly rules: NormalizedRule[];
  public readonly prefixes: Set<string>;
  public readonly finalForms: Readonly<Record<string, string>>;
  public readonly digitsAreLetters: boolean;

  constructor(public readonly scheme: TranslitScheme) {
    const norm: NormalizedRule[] = [];
    const prefixes = new Set<string>();
    let digitsInRules = false;
    for (const r of scheme.rules) {
      const caseFold = r.caseFold !== false;
      const inKey = caseFold ? r.in.toLowerCase() : r.in;
      norm.push({in: inKey, out: r.out, caseFold});
      if (!digitsInRules) {
        for (let i = 0; i < r.in.length; i++) {
          if (isAsciiDigit(r.in.charCodeAt(i))) {
            digitsInRules = true;
            break;
          }
        }
      }
    }
    norm.sort((a, b) => b.in.length - a.in.length);
    for (const r of norm) {
      for (let i = 1; i < r.in.length; i++) prefixes.add(r.in.slice(0, i));
    }
    this.rules = norm;
    this.prefixes = prefixes;
    this.finalForms = scheme.finalForms ?? {};
    this.digitsAreLetters = digitsInRules;
  }

  public exact(s: string): NormalizedRule | null {
    if (!s) return null;
    const lc = s.toLowerCase();
    for (const r of this.rules) {
      const key = r.caseFold ? lc : s;
      if (r.in === key) return r;
    }
    return null;
  }

  public isPrefix(s: string): boolean {
    if (!s) return false;
    return this.prefixes.has(s.toLowerCase());
  }

  /** Longest rule whose `in` is a prefix of `s`. */
  public longestPrefix(s: string): NormalizedRule | null {
    if (!s) return null;
    const lc = s.toLowerCase();
    for (const r of this.rules) {
      if (r.in.length > s.length) continue;
      const head = r.caseFold ? lc.slice(0, r.in.length) : s.slice(0, r.in.length);
      if (head === r.in) return r;
    }
    return null;
  }

  /** Greedy-eat: emit each char/digraph using the longest rule that fits. */
  public greedyEmit(s: string): string {
    let out = '';
    let i = 0;
    while (i < s.length) {
      const rest = s.slice(i);
      const r = this.longestPrefix(rest);
      if (r) {
        out += applyCase(r, rest.slice(0, r.in.length));
        i += r.in.length;
      } else {
        out += s.charAt(i);
        i += 1;
      }
    }
    return out;
  }

  /** Whether `ch` is a buffer-eligible "letter" for this scheme. */
  public isLetter(ch: string): boolean {
    if (!ch) return false;
    const c = ch.charCodeAt(0);
    if (c === 39 || isAsciiUpper(c) || isAsciiLower(c)) return true;
    if (this.digitsAreLetters && isAsciiDigit(c)) return true;
    return false;
  }

  /** Final-form replacement for the last code point of an emitted run. */
  public applyFinalForm(emit: string): {tail: number; replacement: string} | null {
    if (!emit) return null;
    const last = lastCodePoint(emit);
    const replacement = this.finalForms[last.glyph];
    if (!replacement) return null;
    return {tail: last.units, replacement};
  }
}

const lastCodePoint = (s: string): {glyph: string; units: number} => {
  const lastIdx = s.length - 1;
  const code = s.charCodeAt(lastIdx);
  if (code >= 0xdc00 && code <= 0xdfff && lastIdx > 0) {
    const high = s.charCodeAt(lastIdx - 1);
    if (high >= 0xd800 && high <= 0xdbff) {
      return {glyph: s.slice(lastIdx - 1), units: 2};
    }
  }
  return {glyph: s.charAt(lastIdx), units: 1};
};

const applyCase = (rule: NormalizedRule, input: string): string => {
  if (!rule.caseFold) return rule.out;
  if (!input) return rule.out;
  const firstUp = isAsciiUpper(input.charCodeAt(0));
  if (!firstUp) return rule.out;
  if (input.length > 1 && isAsciiUpper(input.charCodeAt(input.length - 1))) {
    return rule.out.toUpperCase();
  }
  return upperFirst(rule.out);
};

/**
 * Stateful matcher. One per editor / input. Holds the partial-digraph buffer,
 * the rewriteable-tail length from the last eager commit, and the previously
 * emitted glyph.
 */
export class Matcher {
  /** Latin chars currently held back in case they extend a digraph. */
  public buffer = '';
  /** UTF-16 length of the just-emitted run that can still be rewritten by an
   * extension. Non-zero only after an eager commit. */
  public lastEmitLen = 0;
  /** Last codepoint emitted since the most recent boundary. */
  public prevGlyph = '';

  constructor(public readonly scheme: CompiledScheme) {}

  public reset(): void {
    this.buffer = '';
    this.lastEmitLen = 0;
    this.prevGlyph = '';
  }

  /** Feed a single character. Multi-char strings go through `flushAndPassthrough`. */
  public feed(ch: string): MatchStep {
    if (ch.length !== 1) return this.flushAndPassthrough(ch);
    if (!this.scheme.isLetter(ch)) return this.feedBoundary(ch);
    const candidate = this.buffer + ch;
    const exact = this.scheme.exact(candidate);
    const isPrefix = this.scheme.isPrefix(candidate);
    if (exact) {
      const out = applyCase(exact, candidate);
      const replaceTail = this.lastEmitLen;
      this.prevGlyph = lastCodePoint(out).glyph;
      if (isPrefix) {
        this.buffer = candidate;
        this.lastEmitLen = out.length;
        return {replaceTail, emit: out, reset: false};
      }
      this.buffer = '';
      this.lastEmitLen = 0;
      return {replaceTail, emit: out, reset: true};
    }
    if (isPrefix) {
      this.buffer = candidate;
      return {replaceTail: 0, emit: '', reset: false};
    }

    // Neither exact nor prefix.
    if (this.buffer.length > 0) {
      if (this.lastEmitLen > 0) {
        this.buffer = '';
        this.lastEmitLen = 0;
        return this.feed(ch);
      }
      const flushed = this.scheme.greedyEmit(this.buffer);
      this.buffer = '';
      this.lastEmitLen = 0;
      if (flushed) this.prevGlyph = lastCodePoint(flushed).glyph;
      const rec = this.feed(ch);
      return {replaceTail: rec.replaceTail, emit: flushed + rec.emit, reset: rec.reset};
    }

    this.lastEmitLen = 0;
    this.prevGlyph = ch;
    return {replaceTail: 0, emit: ch, reset: true};
  }

  private feedBoundary(ch: string): MatchStep {
    let emit = '';
    let replaceTail = 0;
    if (this.buffer.length > 0) {
      replaceTail = this.lastEmitLen;
      emit = this.scheme.greedyEmit(this.buffer);
      this.buffer = '';
      if (emit) this.prevGlyph = lastCodePoint(emit).glyph;
    }
    // Apply final-form to the prevGlyph.
    const prev = this.prevGlyph;
    const finalForm = prev ? this.scheme.finalForms[prev] : undefined;
    if (finalForm) {
      if (emit) {
        const last = lastCodePoint(emit);
        emit = emit.slice(0, emit.length - last.units) + finalForm;
      } else {
        replaceTail += prev.length;
        emit = finalForm;
      }
    }
    this.lastEmitLen = 0;
    this.prevGlyph = '';
    emit += ch;
    return {replaceTail, emit, reset: true};
  }

  public flushBuffer(): MatchStep {
    if (!this.buffer) {
      this.lastEmitLen = 0;
      return {replaceTail: 0, emit: '', reset: true};
    }
    const replaceTail = this.lastEmitLen;
    const emit = this.scheme.greedyEmit(this.buffer);
    this.buffer = '';
    this.lastEmitLen = 0;
    if (emit) this.prevGlyph = lastCodePoint(emit).glyph;
    return {replaceTail, emit, reset: true};
  }

  public flushAndPassthrough(s: string): MatchStep {
    const flushed = this.flushBuffer();
    this.prevGlyph = '';
    return {replaceTail: flushed.replaceTail, emit: flushed.emit + s, reset: true};
  }
}
