import {Editor, Node} from 'slate';
import type {MarkColor} from '../types';

export const getActiveMarkColor = (editor: Editor): MarkColor | true | undefined => {
  const marks = Editor.marks(editor) as {mark?: boolean | MarkColor} | null;
  const value = marks?.mark;
  if (value === false || value === undefined) return undefined;
  return value;
};

export const setMarkColor = (editor: Editor, color: MarkColor | undefined): void => {
  const current = getActiveMarkColor(editor);
  const normalized: MarkColor | undefined = current === true ? 'yellow' : current;
  if (color === undefined || normalized === color) Editor.removeMark(editor, 'mark');
  else Editor.addMark(editor, 'mark', color);
};

export const getActiveFg = (editor: Editor): string | undefined => {
  const marks = Editor.marks(editor) as {fg?: string} | null;
  return marks?.fg;
};

export const setFg = (editor: Editor, color: string | undefined): void => {
  if (!color) Editor.removeMark(editor, 'fg');
  else Editor.addMark(editor, 'fg', color);
};

export const getActiveBg = (editor: Editor): string | undefined => {
  const marks = Editor.marks(editor) as {bg?: string} | null;
  return marks?.bg;
};

export const setBg = (editor: Editor, color: string | undefined): void => {
  if (!color) Editor.removeMark(editor, 'bg');
  else Editor.addMark(editor, 'bg', color);
};

export const collectDocumentColors = (editor: Editor, key: 'fg' | 'bg', limit = 10): string[] => {
  const seen = new Set<string>();
  for (const [node] of Node.texts(editor)) {
    const value = (node as any)[key];
    if (typeof value === 'string' && value) {
      seen.add(value);
      if (seen.size >= limit) break;
    }
  }
  return Array.from(seen);
};
