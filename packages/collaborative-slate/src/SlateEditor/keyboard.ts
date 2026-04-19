import {Editor} from 'slate';
import {insertCodeBlockBreak, redo, setAlignment, toggleBlock, toggleMark, undo} from './behavior';
import {getActiveLink, hasRangeSelection} from './behavior/link';
import type {KeyboardEvent} from 'react';

export interface KeyboardShortcutHandlers {
  requestLinkMenu?: () => void;
}

export const handleKeyboardShortcuts = (
  editor: Editor,
  event: KeyboardEvent<HTMLDivElement>,
  handlers: KeyboardShortcutHandlers = {},
): boolean => {
  const primary = event.metaKey || event.ctrlKey;
  const key = event.key.toLowerCase();

  if (key === 'enter' && primary) {
    if (!insertCodeBlockBreak(editor)) return false;
    event.preventDefault();
    return true;
  }

  if (!primary) return false;

  if (!event.altKey && !event.shiftKey) {
    switch (key) {
      case 'b':
        event.preventDefault();
        toggleMark(editor, 'bold');
        return true;
      case 'i':
        event.preventDefault();
        toggleMark(editor, 'italic');
        return true;
      case 'u':
        event.preventDefault();
        toggleMark(editor, 'underline');
        return true;
      case 'e':
        event.preventDefault();
        toggleMark(editor, 'code');
        return true;
      case 'k':
        if (!hasRangeSelection(editor) && !getActiveLink(editor)) return false;
        event.preventDefault();
        handlers.requestLinkMenu?.();
        return true;
      case 'y':
        event.preventDefault();
        redo(editor);
        return true;
    }
  }

  if (key === 'z') {
    event.preventDefault();
    if (event.shiftKey) redo(editor);
    else undo(editor);
    return true;
  }

  if (event.altKey) {
    switch (key) {
      case '0':
        event.preventDefault();
        toggleBlock(editor, 'p');
        return true;
      case '1':
        event.preventDefault();
        toggleBlock(editor, 'h1');
        return true;
      case '2':
        event.preventDefault();
        toggleBlock(editor, 'h2');
        return true;
      case '3':
        event.preventDefault();
        toggleBlock(editor, 'h3');
        return true;
      case '7':
        event.preventDefault();
        toggleBlock(editor, 'ol');
        return true;
      case '8':
        event.preventDefault();
        toggleBlock(editor, 'ul');
        return true;
    }
  }

  if (event.shiftKey) {
    switch (key) {
      case 'q':
        event.preventDefault();
        toggleBlock(editor, 'blockquote');
        return true;
      case 'c':
        event.preventDefault();
        toggleBlock(editor, 'code-block');
        return true;
      case 'l':
        event.preventDefault();
        setAlignment(editor, 'left');
        return true;
      case 'e':
        event.preventDefault();
        setAlignment(editor, 'center');
        return true;
      case 'r':
        event.preventDefault();
        setAlignment(editor, 'right');
        return true;
      case 'j':
        event.preventDefault();
        setAlignment(editor, 'justify');
        return true;
    }
  }

  return false;
};
