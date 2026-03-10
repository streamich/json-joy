import type {Key} from './Key';

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

export type SigMod = '' | 'A' | 'C' | 'M' | 'S' | 'AC' | 'AM' | 'AS' | 'CM' | 'CS' | 'MS' | 'ACM' | 'ACS' | 'AMS' | 'CMS' | 'ACMS';
export type SigKey =
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12'
  | ',' | '.' | '/' | ';' | '\'' | '[' | ']' | '\\' | '-' | '='
  | 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft' | 'Enter' | 'Escape' | 'Tab' | 'Backspace' | 'Delete' | 'Home' | 'End' | 'PageUp' | 'PageDown' | 'Space';
export type SigRepeat = 'R';
export type Signature = `${(`${SigMod}+`) | ''}${SigKey}${(`:${SigRepeat}`) | ''}`;

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

export type KeyBindingShorthand = [
  signature: Signature,
  action: KeyAction,
  options?: KeyBindingOptions,
];

export type KeyAction = (key: Key) => void;