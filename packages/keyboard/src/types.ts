import type {Key} from './Key';
import type {KeySet} from './KeySet';

export interface KeyEvent {
  stopPropagation(): void;
  preventDefault(): void;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  isComposing?: boolean;
  key?: string;
  repeat?: boolean;
}

export interface KeySink {
  onPress(key: Key): void;
  onRelease(key: Key): void;
  onReset(): void;
}

export interface KeySource {
  bind(sink: KeySink): () => void;
}

export type SigMod =
  | ''
  | 'A'
  | 'C'
  | 'M'
  | 'S'
  | 'AC'
  | 'AM'
  | 'AS'
  | 'CM'
  | 'CS'
  | 'MS'
  | 'ACM'
  | 'ACS'
  | 'AMS'
  | 'CMS'
  | 'ACMS';
export type SigKey =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'F1'
  | 'F2'
  | 'F3'
  | 'F4'
  | 'F5'
  | 'F6'
  | 'F7'
  | 'F8'
  | 'F9'
  | 'F10'
  | 'F11'
  | 'F12'
  | ','
  | '.'
  | '/'
  | ';'
  | "'"
  | '['
  | ']'
  | '\\'
  | '-'
  | '='
  | 'ArrowUp'
  | 'ArrowRight'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'Enter'
  | 'Escape'
  | 'Tab'
  | 'Backspace'
  | 'Delete'
  | 'Home'
  | 'End'
  | 'PageUp'
  | 'PageDown'
  | 'Space';
export type SigRepeat = 'R';

/** Normal key signature, e.g. `'a'`, `'C+s'`, `'S+F5:R'`. */
export type SigNormal = `${`${SigMod}+` | ''}${SigKey}${`:${SigRepeat}` | ''}`;

/**
 * - `''` — matches **every** key (catch-all / logging).
 * - `'?'` — matches only **unhandled** keys (fallback).
 */
export type SigWildcard = '' | '?';

export type Signature = SigNormal | SigWildcard;

export interface KeyBindingDefinition {
  keys: (KeyBinding | KeyBindingShorthand)[];
}

export interface KeyBindingOptions {
  /** Whether to propagate the event to parent contexts, defaults to `false`. */
  propagate?: boolean;
  /** Whether this binding is for key release events, defaults to `false`. */
  release?: boolean;
}

export interface KeyBinding extends KeyBindingOptions {
  /** Key press/release signature to test for. */
  sig: Signature;
  /** Callback to execute when the key is pressed. */
  action: KeyAction;
}

export type KeyBindingShorthand = [signature: Signature, action: KeyAction, options?: KeyBindingOptions];

export type KeyAction = (key: Key) => void;

/**
 * Canonical signature for a chord, e.g. `'a+b'`, `'C+j+k'`. Keys are sorted
 * alphabetically after normalization; the shared modifier prefix (if any)
 * precedes them, e.g. `'C+a+b'`.
 */
export type ChordSignature = string;

/** Options for a chord binding. */
export interface ChordBindingOptions {
  /** Whether to propagate the event to parent contexts, defaults to `false`. */
  propagate?: boolean;
}

/** A registered chord handler. */
export interface ChordBinding extends ChordBindingOptions {
  sig: ChordSignature;
  action: ChordAction;
}

/**
 * Callback invoked when a chord is matched. Receives the full set of
 * currently-pressed keys.
 */
export type ChordAction = (pressed: KeySet) => void;

/**
 * Shorthand for a chord binding inside `KeyContext.bind()` / `KeyMap.bind()`:
 * `[chordSignature, action, options?]`.
 *
 * The chord is detected automatically from the signature (two or more
 * plain-key segments separated by `+`, e.g. `'a+b'` or `'C+a+b'`).
 */
export type ChordBindingShorthand = [signature: ChordSignature, action: ChordAction, options?: ChordBindingOptions];
