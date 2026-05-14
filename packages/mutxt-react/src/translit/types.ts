/**
 * Schema for a translit "scheme" — a mapping table that turns Latin/ASCII
 * keystrokes into a target script. Schemes are pure data so a new language is
 * a JSON object plus a unit-test fixture, not engine code. See `./schemes/`
 * for examples.
 */

export type SchemeKind = 'alphabet' | 'abugida';

export interface TranslitScheme {
  /** Stable id. */
  id: string;
  /** Human label shown in pickers, e.g. `"Russian (translit)"`. */
  name: string;
  /** Two-letter code for indicators (footer pill, caret pill).
   * Falls back to the first two chars of `language` if omitted. */
  short?: string;
  /** ISO 639-1/3 of the *target* language, e.g. `"ru"`, `"hi"`. */
  language: string;
  /** ISO 15924 script code, e.g. `"Cyrl"`, `"Deva"`. */
  script: string;
  /** Writing direction. Default `"ltr"`. */
  direction?: 'ltr' | 'rtl';
  /** Engine kind. */
  kind: SchemeKind;
  /** The mapping rules. Order does not matter — sorted longest-first at load. */
  rules: TranslitRule[];
  /** Per-letter "final form" overrides applied when the next event is a
   * word boundary (whitespace, punctuation, end of input). */
  finalForms?: Readonly<Record<string, string>>;
}

export interface TranslitRule {
  /** ASCII input — typically 1, 2, or 3 chars. */
  in: string;
  /** Output codepoints. */
  out: string;
  /** If `true` (default), the matcher folds case on input and uppercases the
   * output when the input was uppercase. */
  caseFold?: boolean;
}
