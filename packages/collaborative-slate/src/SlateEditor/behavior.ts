import type {KeyboardEvent} from 'react';
import {Editor, Element as SlateElement, Transforms} from 'slate';
import {HistoryEditor} from 'slate-history';
import type {
  BlockFormat,
  CustomElement,
  ListElementType,
  MarkFormat,
  SlateTextAlign,
  ToolbarButtonDefinition,
} from './types';

export const LIST_TYPES: ListElementType[] = ['ul', 'ol'];
export const ALIGNMENTS: SlateTextAlign[] = ['left', 'center', 'right', 'justify'];
export const MARKS: MarkFormat[] = ['bold', 'italic', 'underline', 'code'];

const isElement = (node: unknown): node is CustomElement => SlateElement.isElement(node);

export const isListType = (format: string): format is ListElementType => LIST_TYPES.includes(format as ListElementType);

export const isMarkActive = (editor: Editor, format: MarkFormat): boolean => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const toggleMark = (editor: Editor, format: MarkFormat): void => {
  if (isMarkActive(editor, format)) Editor.removeMark(editor, format);
  else Editor.addMark(editor, format, true);
};

export const isBlockActive = (editor: Editor, format: Exclude<BlockFormat, ListElementType>): boolean => {
  const {selection} = editor;
  if (!selection) return false;
  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && node.type === format,
  });
  return !!match;
};

export const isListActive = (editor: Editor, format: ListElementType): boolean => {
  const {selection} = editor;
  if (!selection) return false;
  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && node.type === format,
  });
  return !!match;
};

export const getActiveAlignment = (editor: Editor): SlateTextAlign => {
  const {selection} = editor;
  if (!selection) return 'left';
  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && Editor.isBlock(editor, node) && node.type !== 'ul' && node.type !== 'ol',
  });
  if (!match) return 'left';
  const [element] = match as [CustomElement, number[]];
  return (element.align as SlateTextAlign | undefined) ?? 'left';
};

export const isAlignmentActive = (editor: Editor, alignment: SlateTextAlign): boolean =>
  getActiveAlignment(editor) === alignment;

const unwrapLists = (editor: Editor): void => {
  Transforms.unwrapNodes(editor, {
    match: (node) => isElement(node) && isListType(node.type),
    split: true,
  });
};

export const toggleBlock = (editor: Editor, format: BlockFormat): void => {
  const isList = isListType(format);
  const isActive = isList ? isListActive(editor, format) : isBlockActive(editor, format);

  unwrapLists(editor);

  const nextType = isActive ? 'p' : isList ? 'li' : format;

  Transforms.setNodes(editor, {type: nextType} as Partial<CustomElement>, {
    match: (node) => isElement(node) && Editor.isBlock(editor, node) && !isListType(node.type),
  });

  if (!isActive && isList) {
    Transforms.wrapNodes(editor, {type: format, children: []} as CustomElement, {
      match: (node) => isElement(node) && node.type === 'li',
    });
  }
};

export const setAlignment = (editor: Editor, alignment: SlateTextAlign): void => {
  const current = getActiveAlignment(editor);
  const shouldUnset = alignment === 'left' || current === alignment;

  if (shouldUnset) {
    Transforms.unsetNodes(editor, 'align', {
      match: (node) => isElement(node) && Editor.isBlock(editor, node) && node.type !== 'ul' && node.type !== 'ol',
    });
    return;
  }

  Transforms.setNodes(editor, {align: alignment} as Partial<CustomElement>, {
    match: (node) => isElement(node) && Editor.isBlock(editor, node) && node.type !== 'ul' && node.type !== 'ol',
  });
};

export const clearFormatting = (editor: Editor): void => {
  for (const mark of MARKS) Editor.removeMark(editor, mark);
  unwrapLists(editor);
  Transforms.unsetNodes(editor, 'align', {
    match: (node) => isElement(node) && Editor.isBlock(editor, node),
  });
  Transforms.setNodes(editor, {type: 'p'} as Partial<CustomElement>, {
    match: (node) => isElement(node) && Editor.isBlock(editor, node) && !isListType(node.type),
  });
};

export const canUndo = (editor: Editor): boolean => HistoryEditor.isHistoryEditor(editor) && editor.history.undos.length > 0;

export const canRedo = (editor: Editor): boolean => HistoryEditor.isHistoryEditor(editor) && editor.history.redos.length > 0;

export const undo = (editor: Editor): void => {
  if (HistoryEditor.isHistoryEditor(editor)) editor.undo();
};

export const redo = (editor: Editor): void => {
  if (HistoryEditor.isHistoryEditor(editor)) editor.redo();
};

export const handleKeyboardShortcuts = (editor: Editor, event: KeyboardEvent<HTMLDivElement>): boolean => {
  const primary = event.metaKey || event.ctrlKey;
  if (!primary) return false;

  const key = event.key.toLowerCase();

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

export const MARK_BUTTONS: ToolbarButtonDefinition<MarkFormat>[] = [
  {key: 'bold', title: 'Bold', iconSet: 'radix', icon: 'font-bold', shortcut: 'Cmd+B', format: 'bold'},
  {key: 'italic', title: 'Italic', iconSet: 'lucide', icon: 'italic', shortcut: 'Cmd+I', format: 'italic'},
  {key: 'underline', title: 'Underline', iconSet: 'tabler', icon: 'underline', shortcut: 'Cmd+U', format: 'underline'},
  {key: 'code', title: 'Inline code', iconSet: 'tabler', icon: 'code', shortcut: 'Cmd+E', format: 'code'},
];

export const BLOCK_BUTTONS: ToolbarButtonDefinition<Exclude<BlockFormat, ListElementType>>[] = [
  {key: 'p', title: 'Paragraph', iconSet: 'tabler', icon: 'pilcrow', shortcut: 'Cmd+Alt+0', format: 'p'},
  {key: 'h1', title: 'Heading 1', iconSet: 'tabler', icon: 'h-1', shortcut: 'Cmd+Alt+1', format: 'h1'},
  {key: 'h2', title: 'Heading 2', iconSet: 'tabler', icon: 'h-2', shortcut: 'Cmd+Alt+2', format: 'h2'},
  {key: 'h3', title: 'Heading 3', iconSet: 'tabler', icon: 'h-3', shortcut: 'Cmd+Alt+3', format: 'h3'},
  {key: 'blockquote', title: 'Blockquote', iconSet: 'lucide', icon: 'quote', shortcut: 'Cmd+Shift+Q', format: 'blockquote'},
  {key: 'code-block', title: 'Code block', iconSet: 'tabler', icon: 'code', shortcut: 'Cmd+Shift+C', format: 'code-block'},
];

export const LIST_BUTTONS: ToolbarButtonDefinition<ListElementType>[] = [
  {key: 'ul', title: 'Bulleted list', iconSet: 'ibm_32', icon: 'list--bulleted', shortcut: 'Cmd+Alt+8', format: 'ul'},
  {key: 'ol', title: 'Numbered list', iconSet: 'ibm_32', icon: 'list--numbered', shortcut: 'Cmd+Alt+7', format: 'ol'},
];

export const ALIGNMENT_BUTTONS: ToolbarButtonDefinition<SlateTextAlign>[] = [
  {key: 'align-left', title: 'Align left', iconSet: 'lucide', icon: 'align-left', shortcut: 'Cmd+Shift+L', format: 'left'},
  {key: 'align-center', title: 'Align center', iconSet: 'lucide', icon: 'align-center', shortcut: 'Cmd+Shift+E', format: 'center'},
  {key: 'align-right', title: 'Align right', iconSet: 'lucide', icon: 'align-right', shortcut: 'Cmd+Shift+R', format: 'right'},
  {key: 'align-justify', title: 'Justify', iconSet: 'lucide', icon: 'align-justify', shortcut: 'Cmd+Shift+J', format: 'justify'},
];

export const ACTION_BUTTONS: ToolbarButtonDefinition[] = [
  {key: 'undo', title: 'Undo', iconSet: 'lucide', icon: 'undo', shortcut: 'Cmd+Z'},
  {key: 'redo', title: 'Redo', iconSet: 'lucide', icon: 'redo', shortcut: 'Cmd+Shift+Z'},
  {key: 'clear-formatting', title: 'Clear formatting', iconSet: 'tabler', icon: 'clear-formatting'},
];