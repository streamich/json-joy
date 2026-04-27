import {insertCodeBlockBreak, insertCodeBlockExit, redo, resetEmptyBlockToParagraph, setAlignment, toggleBlock, toggleMark, undo} from '../behavior';
import {dedentBlock, indentBlock} from './indentation';
import {Key} from '@jsonjoy.com/keyboard';
import type {AnyBinding} from '@jsonjoy.com/keyboard';
import type {MuTxtState} from '../state/MuTxtState';

/**
 * Each handler is responsible for calling `event.preventDefault()` only when
 * it actually consumes the key, so unhandled cases (e.g. `Backspace` outside
 * an empty block) fall through to Slate's default behavior.
 */
export const bindShortcuts = (state: MuTxtState): (() => void) => {
  const editor = state.editor;
  const sync = (): void => state.sync(true);
  const consume = (key: Key, fn: () => void): void => {
    key.event?.preventDefault();
    fn();
    sync();
  };

  const bindings: AnyBinding[] = [
    // ------------------------------------------------------------- Slash menu
    ['/', (key: Key) => {
      if (state.onSlashKey?.()) key.event?.preventDefault();
    }],

    // ----------------------------------------------- Empty-block to paragraph
    ['Backspace', (key: Key) => {
      if (resetEmptyBlockToParagraph(editor)) consume(key, () => {});
    }],
    ['Delete', (key: Key) => {
      if (resetEmptyBlockToParagraph(editor)) consume(key, () => {});
    }],

    // ---------------------------------------- Code-block break / exit (Enter)
    ['Primary+Enter', (key: Key) => {
      if (insertCodeBlockBreak(editor)) consume(key, () => {});
    }],
    ['Shift+Enter', (key: Key) => {
      if (insertCodeBlockExit(editor)) consume(key, () => {});
    }],

    // ------------------------------------------------------------------ Marks
    ['Primary+b', (key: Key) => consume(key, () => toggleMark(editor, 'bold'))],
    ['Primary+i', (key: Key) => consume(key, () => toggleMark(editor, 'italic'))],
    ['Primary+u', (key: Key) => consume(key, () => toggleMark(editor, 'underline'))],
    ['Primary+e', (key: Key) => consume(key, () => toggleMark(editor, 'code'))],

    // ------------------------------------------------------------------- Link
    ['Primary+k', (key: Key) => {
      const link = state.inline.link;
      if (!link.canOpen.value) return;
      key.event?.preventDefault();
      link.setAnchorFromSelection();
      state.inline.dismissed.next(true);
      link.toggle();
    }],

    // ------------------------------------------------------------ Undo / redo
    ['Primary+z', (key: Key) => consume(key, () => undo(editor))],
    ['Primary+Shift+z', (key: Key) => consume(key, () => redo(editor))],
    ['Primary+y', (key: Key) => consume(key, () => redo(editor))],

    // ---------------------------------------------------------- Block toggles
    ['Primary+Alt+0', (key: Key) => consume(key, () => toggleBlock(editor, 'p'))],
    ['Primary+Alt+1', (key: Key) => consume(key, () => toggleBlock(editor, 'h1'))],
    ['Primary+Alt+2', (key: Key) => consume(key, () => toggleBlock(editor, 'h2'))],
    ['Primary+Alt+3', (key: Key) => consume(key, () => toggleBlock(editor, 'h3'))],
    ['Primary+Alt+7', (key: Key) => consume(key, () => toggleBlock(editor, 'ol'))],
    ['Primary+Alt+8', (key: Key) => consume(key, () => toggleBlock(editor, 'ul'))],
    ['Primary+Shift+q', (key: Key) => consume(key, () => toggleBlock(editor, 'blockquote'))],
    ['Primary+Shift+c', (key: Key) => consume(key, () => toggleBlock(editor, 'code-block'))],

    // -------------------------------------------------------------- Alignment
    ['Primary+Shift+l', (key: Key) => consume(key, () => setAlignment(editor, 'left'))],
    ['Primary+Shift+e', (key: Key) => consume(key, () => setAlignment(editor, 'center'))],
    ['Primary+Shift+r', (key: Key) => consume(key, () => setAlignment(editor, 'right'))],
    ['Primary+Shift+j', (key: Key) => consume(key, () => setAlignment(editor, 'justify'))],

    // ------------------------------------------------------------ Indentation
    ['Primary+]', (key: Key) => consume(key, () => indentBlock(editor))],
    ['Primary+[', (key: Key) => consume(key, () => dedentBlock(editor))],
  ];

  return state.kbd.bind(bindings);
};
