import {Editor, Element as SlateElement, Node, Path, Range, Transforms} from 'slate';
import {HistoryEditor} from 'slate-history';
import type {
  BlockFormat,
  CustomElement,
  ListElementType,
  MarkFormat,
  SlateTextAlign,
  ToolbarButtonDefinition,
} from './types';
import {removeLink} from './behavior/link';

export const LIST_TYPES: ListElementType[] = ['ul', 'ol', 'checklist'];
export const ALIGNMENTS: SlateTextAlign[] = ['left', 'center', 'right', 'justify'];
export const MARKS: MarkFormat[] = [
  'bold',
  'code',
  'del',
  'ins',
  'italic',
  'kbd',
  'mark',
  'overline',
  'spoiler',
  'strikethrough',
  'sub',
  'sup',
  'underline',
];

const isElement = (node: unknown): node is CustomElement => SlateElement.isElement(node);
const isFormattableBlock = (node: CustomElement): boolean => !isListType(node.type) && node.type !== 'embed';

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

const isAtEndOfBlock = (editor: Editor, format: Exclude<BlockFormat, ListElementType>): boolean => {
  const {selection} = editor;
  if (!selection || !Range.isCollapsed(selection)) return false;
  const match = Editor.above(editor, {
    at: selection,
    match: (node) => isElement(node) && node.type === format,
    mode: 'lowest',
  });
  if (!match) return false;
  const [, path] = match;
  return Editor.isEnd(editor, selection.anchor, path);
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
    match: (node) => isElement(node) && Editor.isBlock(editor, node) && isFormattableBlock(node),
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

const getCurrentBlockEntry = (editor: Editor): [CustomElement, Path] | null => {
  const {selection} = editor;
  if (!selection) return null;
  const match = Editor.above(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && Editor.isBlock(editor, node),
    mode: 'lowest',
  });
  return (match as [CustomElement, Path] | undefined) ?? null;
};

const getCurrentListType = (editor: Editor): ListElementType | null => {
  const {selection} = editor;
  if (!selection) return null;
  const match = Editor.above(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && isListType(node.type),
    mode: 'lowest',
  });
  return match ? ((match[0] as CustomElement).type as ListElementType) : null;
};

export const toggleBlock = (editor: Editor, format: BlockFormat): void => {
  const isList = isListType(format);
  const isActive = isList ? isListActive(editor, format) : isBlockActive(editor, format);
  unwrapLists(editor);
  const nextType = isActive ? 'p' : isList ? 'li' : format;
  Transforms.setNodes(editor, {type: nextType} as Partial<CustomElement>, {
    match: (node) => isElement(node) && Editor.isBlock(editor, node) && isFormattableBlock(node),
  });
  if (!isActive && isList) {
    Transforms.wrapNodes(editor, {type: format, children: []} as CustomElement, {
      match: (node) => isElement(node) && node.type === 'li',
    });
  }
  if (format === 'checklist' && !isActive) {
    Transforms.setNodes(editor, {checked: false} as Partial<CustomElement>, {
      match: (node) => isElement(node) && node.type === 'li',
    });
  } else {
    Transforms.unsetNodes(editor, 'checked', {
      match: (node) => isElement(node) && Editor.isBlock(editor, node) && !isListType(node.type),
    });
  }
};

export const setAlignment = (editor: Editor, alignment: SlateTextAlign): void => {
  const current = getActiveAlignment(editor);
  const shouldUnset = alignment === 'left' || current === alignment;

  if (shouldUnset) {
    Transforms.unsetNodes(editor, 'align', {
      match: (node) => isElement(node) && Editor.isBlock(editor, node) && isFormattableBlock(node),
    });
    return;
  }

  Transforms.setNodes(editor, {align: alignment} as Partial<CustomElement>, {
    match: (node) => isElement(node) && Editor.isBlock(editor, node) && isFormattableBlock(node),
  });
};

export const eraseMarks = (editor: Editor): void => {
  removeLink(editor);
  for (const mark of MARKS) Editor.removeMark(editor, mark);
};

export const setChecklistItemChecked = (editor: Editor, path: Path, checked: boolean): void => {
  Transforms.setNodes(editor, {checked} as Partial<CustomElement>, {
    at: path,
    match: (node) => isElement(node) && node.type === 'li',
  });
};

export const resetEmptyBlockToParagraph = (editor: Editor): boolean => {
  const {selection} = editor;
  if (!selection || !Range.isCollapsed(selection)) return false;
  const entry = getCurrentBlockEntry(editor);
  if (!entry) return false;
  const [block] = entry;
  if (block.type === 'embed') return false;
  if (Node.string(block) !== '') return false;
  if (block.type === 'p') return false;
  if (block.type === 'li') {
    const listType = getCurrentListType(editor);
    if (!listType) {
      Transforms.setNodes(editor, {type: 'p'} as Partial<CustomElement>, {
        match: (node) => isElement(node) && Editor.isBlock(editor, node) && node.type === 'li',
      });
      return true;
    }
    toggleBlock(editor, listType);
    return true;
  }
  toggleBlock(editor, block.type as Exclude<BlockFormat, ListElementType>);
  return true;
};

const isInRawTextBlock = (editor: Editor): boolean =>
  isBlockActive(editor, 'code-block') || isBlockActive(editor, 'pre');

export const insertCodeBlockBreak = (editor: Editor): boolean => {
  if (!isInRawTextBlock(editor)) return false;
  Editor.insertText(editor, '\n');
  return true;
};

export const insertCodeBlockExit = (editor: Editor): boolean => {
  const {selection} = editor;
  if (!selection) return false;
  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) => isElement(node) && (node.type === 'code-block' || node.type === 'pre'),
  });
  if (!match) return false;
  const [, path] = match;
  const afterPath = Path.next(path);
  Transforms.insertNodes(editor, {type: 'p', children: [{text: ''}]} as CustomElement, {at: afterPath});
  Transforms.select(editor, afterPath);
  return true;
};

export const withCodeBlockBreaks = <T extends Editor>(editor: T): T => {
  const {insertBreak} = editor;
  editor.insertBreak = () => {
    if (insertCodeBlockBreak(editor)) return;
    const inHeading = isBlockActive(editor, 'h1') || isBlockActive(editor, 'h2') || isBlockActive(editor, 'h3')
      || isBlockActive(editor, 'h4') || isBlockActive(editor, 'h5') || isBlockActive(editor, 'h6')
      || isBlockActive(editor, 'title') || isBlockActive(editor, 'subtitle')
      || isBlockActive(editor, 'blockquote') || isBlockActive(editor, 'callout');
    const atEndOfTitle = isAtEndOfBlock(editor, 'title');
    insertBreak();
    if (inHeading) {
      const nextType: CustomElement['type'] = atEndOfTitle ? 'subtitle' : 'p';
      Transforms.setNodes(editor, {type: nextType} as Partial<CustomElement>);
    }
  };

  // Inside a code-block or pre block, paste raw text.
  const reactEditor = editor as Editor & {insertData?: (data: DataTransfer) => void};
  const {insertData} = reactEditor;
  if (insertData) {
    reactEditor.insertData = (data: DataTransfer) => {
      if (isInRawTextBlock(editor)) {
        const text = data.getData('text/plain');
        if (text) {
          Editor.insertText(editor, text);
          return;
        }
      }
      insertData(data);
    };
  }
  return editor;
};

export const canUndo = (editor: Editor): boolean => HistoryEditor.isHistoryEditor(editor) && editor.history.undos.length > 0;

export const canRedo = (editor: Editor): boolean => HistoryEditor.isHistoryEditor(editor) && editor.history.redos.length > 0;

export const undo = (editor: Editor): void => {
  if (HistoryEditor.isHistoryEditor(editor)) editor.undo();
};

export const redo = (editor: Editor): void => {
  if (HistoryEditor.isHistoryEditor(editor)) editor.redo();
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

export const LAYOUT_BUTTONS: ToolbarButtonDefinition<'columns'>[] = [
  {key: 'columns', title: 'Two columns', iconSet: 'tabler', icon: 'columns', format: 'columns'},
];

export const LIST_BUTTONS: ToolbarButtonDefinition<ListElementType>[] = [
  {key: 'ul', title: 'Bulleted list', iconSet: 'ibm_32', icon: 'list--bulleted', shortcut: 'Cmd+Alt+8', format: 'ul'},
  // {key: 'ul', title: 'Bulleted list', iconSet: 'bootstrap', icon: 'list-ul', shortcut: 'Cmd+Alt+8', format: 'ul'},
  {key: 'ol', title: 'Numbered list', iconSet: 'ibm_32', icon: 'list--numbered', shortcut: 'Cmd+Alt+7', format: 'ol'},
  // {key: 'ol', title: 'Numbered list', iconSet: 'bootstrap', icon: 'list-ol', shortcut: 'Cmd+Alt+7', format: 'ol'},
  // {key: 'checklist', title: 'Checklist', iconSet: 'lucide', icon: 'list-todo', format: 'checklist'},
  // {key: 'checklist', title: 'Checklist', iconSet: 'bootstrap', icon: 'list-check', format: 'checklist'},
  {key: 'checklist', title: 'Checklist', iconSet: 'ibm_32', icon: 'list--checked', format: 'checklist'},
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
];