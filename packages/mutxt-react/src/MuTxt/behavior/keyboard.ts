import {insertCodeBlockBreak, insertCodeBlockExit, redo, resetEmptyBlockToParagraph, setAlignment, toggleBlock, toggleMark, undo} from '../behavior';
import {dedentBlock, indentBlock} from './indentation';
import {Key} from '@jsonjoy.com/keyboard';
import type {AnyBinding, Signature} from '@jsonjoy.com/keyboard';
import type {MuTxtState} from '../state/MuTxtState';

/**
 * Each handler is responsible for calling `event.preventDefault()` only when
 * it actually consumes the key, so unhandled cases (e.g. `Backspace` outside
 * an empty block) fall through to Slate's default behavior.
 */
export const bindShortcuts = (state: MuTxtState): (() => void) => {
  const editor = state.editor;
  const consume = (key: Key, fn?: () => void): void => {
    key.event?.preventDefault();
    fn?.();
    state.sync(true);
  };

  const bindings: AnyBinding[] = [
    // ------------------------------------------------------------- Slash menu
    ['/', (key: Key) => {
      if (state.onSlashKey?.()) key.event?.preventDefault();
    }],
    ['Shift Shift', () => {
      // state.onSlashKey?.();
      const open = state.voids.open;
      open.set(!open.value);
    }],

    // ----------------------------------------------- Empty-block to paragraph
    ['Backspace', (key: Key) => {
      if (resetEmptyBlockToParagraph(editor)) consume(key);
    }],
    ['Delete', (key: Key) => {
      if (resetEmptyBlockToParagraph(editor)) consume(key);
    }],

    // ---------------------------------------- Code-block break / exit (Enter)
    ['P+Enter', (key: Key) => {
      if (insertCodeBlockBreak(editor)) consume(key);
    }],
    ['Shift+Enter', (key: Key) => {
      if (insertCodeBlockExit(editor)) consume(key);
    }],

    // ------------------------------------------------------------------ Marks
    ['P+b', (key: Key) => consume(key, () => toggleMark(editor, 'bold'))],
    ['P+i', (key: Key) => consume(key, () => toggleMark(editor, 'italic'))],
    ['P+u', (key: Key) => consume(key, () => toggleMark(editor, 'underline'))],
    ['P+e', (key: Key) => consume(key, () => toggleMark(editor, 'code'))],
    ['P+Shift+x', (key: Key) => consume(key, () => toggleMark(editor, 'strikethrough'))],

    // ------------------------------------------------------------------- Link
    ['P+k', (key: Key) => {
      const link = state.inline.link;
      if (!link.canOpen.value) return;
      key.event?.preventDefault();
      link.setAnchorFromSelection();
      state.inline.dismissed.next(true);
      link.toggle();
    }],

    // ------------------------------------------------------------ Undo / redo
    ['P+z', (key: Key) => consume(key, () => undo(editor))],
    ['P+Shift+z', (key: Key) => consume(key, () => redo(editor))],
    ['P+y', (key: Key) => consume(key, () => redo(editor))],

    // ---------------------------------------------------------- Block toggles
    ['P+Alt+@Digit0' as Signature, (key: Key) => consume(key, () => toggleBlock(editor, 'p'))],
    ['P+Alt+@Digit1' as Signature, (key: Key) => consume(key, () => toggleBlock(editor, 'h1'))],
    ['P+Alt+@Digit2' as Signature, (key: Key) => consume(key, () => toggleBlock(editor, 'h2'))],
    ['P+Alt+@Digit3' as Signature, (key: Key) => consume(key, () => toggleBlock(editor, 'h3'))],
    ['P+Alt+@Digit4' as Signature, (key: Key) => consume(key, () => toggleBlock(editor, 'h4'))],
    ['P+Alt+@Digit5' as Signature, (key: Key) => consume(key, () => toggleBlock(editor, 'h5'))],
    ['P+Alt+@Digit6' as Signature, (key: Key) => consume(key, () => toggleBlock(editor, 'h6'))],
    ['P+Alt+@Digit7' as Signature, (key: Key) => consume(key, () => toggleBlock(editor, 'ol'))],
    ['P+Alt+@Digit8' as Signature, (key: Key) => consume(key, () => toggleBlock(editor, 'ul'))],
    ['P+Alt+@Digit9' as Signature, (key: Key) => consume(key, () => toggleBlock(editor, 'blockquote'))],
    ['P+Shift+q', (key: Key) => consume(key, () => toggleBlock(editor, 'blockquote'))],
    ['P+Shift+c', (key: Key) => consume(key, () => toggleBlock(editor, 'code-block'))],

    // -------------------------------------------------------------- Alignment
    ['P+Shift+l', (key: Key) => consume(key, () => setAlignment(editor, 'left'))],
    ['P+Shift+e', (key: Key) => consume(key, () => setAlignment(editor, 'center'))],
    ['P+Shift+r', (key: Key) => consume(key, () => setAlignment(editor, 'right'))],
    ['P+Shift+j', (key: Key) => consume(key, () => setAlignment(editor, 'justify'))],

    // ------------------------------------------------------------ Indentation
    ['P+]', (key: Key) => consume(key, () => indentBlock(editor))],
    ['P+[', (key: Key) => consume(key, () => dedentBlock(editor))],
  ];

  return state.kbd.bind(bindings);
};
